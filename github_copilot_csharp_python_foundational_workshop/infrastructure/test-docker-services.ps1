#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integration test script for Road Trip Planner Docker Compose services.
.DESCRIPTION
    Starts all Docker Compose services, waits for health, then tests
    each endpoint through the BFF proxy and directly on each backend.
    Exits with code 0 if all tests pass, 1 otherwise.
.PARAMETER SkipBuild
    Skip docker-compose build (use existing images).
.PARAMETER SkipUp
    Skip docker-compose up (assume services are already running).
.PARAMETER Teardown
    Run docker-compose down after tests complete.
.EXAMPLE
    .\infrastructure\test-docker-services.ps1
    .\infrastructure\test-docker-services.ps1 -SkipBuild -Teardown
    .\infrastructure\test-docker-services.ps1 -SkipUp
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipUp,
    [switch]$Teardown
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# ── Configuration ──
$BFF_URL       = "http://localhost:3000"
$PYTHON_URL    = "http://localhost:8000"
$CSHARP_URL    = "http://localhost:8081"
$JAVA_URL      = "http://localhost:8082"
$FRONTEND_URL  = "http://localhost:5173"
$MAX_WAIT_SECS = 120
$POLL_INTERVAL = 5

# ── State ──
$passed  = 0
$failed  = 0
$skipped = 0
$results = @()

# ── Helpers ──
function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-TestResult($name, $status, $detail) {
    $icon = switch ($status) {
        "PASS" { Write-Host "  [PASS] " -NoNewline -ForegroundColor Green; "PASS" }
        "FAIL" { Write-Host "  [FAIL] " -NoNewline -ForegroundColor Red; "FAIL" }
        "SKIP" { Write-Host "  [SKIP] " -NoNewline -ForegroundColor Yellow; "SKIP" }
    }
    Write-Host "$name" -NoNewline
    if ($detail) { Write-Host " — $detail" -ForegroundColor DarkGray } else { Write-Host "" }
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$ContentType = "application/json",
        [string]$ExpectContains = $null,
        [int]$ExpectStatus = 200,
        [int]$TimeoutSec = 15
    )

    try {
        $params = @{
            Uri            = $Url
            Method         = $Method
            TimeoutSec     = $TimeoutSec
            ErrorAction    = "Stop"
            UseBasicParsing = $true
        }

        if ($Body) {
            $params.Body = $Body
            $params.ContentType = $ContentType
        }

        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content

        if ($statusCode -ne $ExpectStatus) {
            $script:failed++
            $script:results += @{ Name = $Name; Status = "FAIL"; Detail = "Expected $ExpectStatus, got $statusCode" }
            Write-TestResult $Name "FAIL" "Expected HTTP $ExpectStatus, got $statusCode"
            return
        }

        if ($ExpectContains -and $content -notmatch [regex]::Escape($ExpectContains)) {
            $script:failed++
            $script:results += @{ Name = $Name; Status = "FAIL"; Detail = "Response missing: $ExpectContains" }
            Write-TestResult $Name "FAIL" "Response body missing: '$ExpectContains'"
            return
        }

        $script:passed++
        $script:results += @{ Name = $Name; Status = "PASS"; Detail = "HTTP $statusCode" }
        Write-TestResult $Name "PASS" "HTTP $statusCode"
    }
    catch {
        $errMsg = $_.Exception.Message
        # Check if we got a response with expected non-200 status
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            if ($statusCode -eq $ExpectStatus) {
                $script:passed++
                $script:results += @{ Name = $Name; Status = "PASS"; Detail = "HTTP $statusCode (expected)" }
                Write-TestResult $Name "PASS" "HTTP $statusCode (expected)"
                return
            }
        }
        $script:failed++
        $script:results += @{ Name = $Name; Status = "FAIL"; Detail = $errMsg }
        Write-TestResult $Name "FAIL" $errMsg
    }
}

function Wait-ForService {
    param(
        [string]$Name,
        [string]$Url,
        [int]$MaxWait = $MAX_WAIT_SECS,
        [int]$Interval = $POLL_INTERVAL
    )

    Write-Host "  Waiting for $Name at $Url ..." -NoNewline
    $elapsed = 0
    while ($elapsed -lt $MaxWait) {
        try {
            $null = Invoke-WebRequest -Uri $Url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            Write-Host " ready ($elapsed`s)" -ForegroundColor Green
            return $true
        }
        catch {
            Start-Sleep -Seconds $Interval
            $elapsed += $Interval
            Write-Host "." -NoNewline
        }
    }
    Write-Host " TIMEOUT after $MaxWait`s" -ForegroundColor Red
    return $false
}

# ══════════════════════════════════════════════════════════
#  PHASE 1: Start Docker Compose
# ══════════════════════════════════════════════════════════

if (-not $SkipUp) {
    Write-Header "Starting Docker Compose Services"

    Push-Location (Split-Path $PSScriptRoot -Parent)

    if (-not $SkipBuild) {
        Write-Host "  Building images (this may take a few minutes)..."
        docker compose build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Docker build failed!" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    }

    Write-Host "  Starting services..."
    docker compose up -d 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Docker Compose up failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
}

# ══════════════════════════════════════════════════════════
#  PHASE 2: Wait for Services to be Ready
# ══════════════════════════════════════════════════════════

Write-Header "Waiting for Services"

$servicesReady = $true
$serviceChecks = @(
    @{ Name = "PostgreSQL (via Python)"; Url = "$PYTHON_URL/health" },
    @{ Name = "C# Backend";             Url = "$CSHARP_URL/health" },
    @{ Name = "Java Backend";           Url = "$JAVA_URL/health" },
    @{ Name = "BFF Gateway";            Url = "$BFF_URL/health" },
    @{ Name = "Frontend (Nginx)";       Url = "$FRONTEND_URL" }
)

foreach ($svc in $serviceChecks) {
    if (-not (Wait-ForService -Name $svc.Name -Url $svc.Url)) {
        $servicesReady = $false
        Write-Host "  WARNING: $($svc.Name) did not become ready" -ForegroundColor Yellow
    }
}

if (-not $servicesReady) {
    Write-Host ""
    Write-Host "  Some services failed to start. Running tests against available services..." -ForegroundColor Yellow
    Write-Host "  Check logs: docker compose logs <service>" -ForegroundColor Yellow
}

# ══════════════════════════════════════════════════════════
#  PHASE 3: Direct Backend Health Checks
# ══════════════════════════════════════════════════════════

Write-Header "Direct Backend Health Checks"

Test-Endpoint -Name "Python /health" `
    -Url "$PYTHON_URL/health" `
    -ExpectContains "status"

Test-Endpoint -Name "C# /health" `
    -Url "$CSHARP_URL/health" `
    -ExpectContains "Healthy"

Test-Endpoint -Name "Java /health" `
    -Url "$JAVA_URL/health" `
    -ExpectContains "healthy"

Test-Endpoint -Name "Frontend (Nginx)" `
    -Url "$FRONTEND_URL" `
    -ExpectStatus 200

# ══════════════════════════════════════════════════════════
#  PHASE 4: BFF Aggregated Health
# ══════════════════════════════════════════════════════════

Write-Header "BFF Aggregated Health"

Test-Endpoint -Name "BFF /health (aggregated)" `
    -Url "$BFF_URL/health" `
    -ExpectContains "backends"

# ══════════════════════════════════════════════════════════
#  PHASE 5: C# AI Service via BFF
# ══════════════════════════════════════════════════════════

Write-Header "C# AI Service (via BFF proxy)"

Test-Endpoint -Name "Parse vehicle: truck" `
    -Url "$BFF_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": "2024 Ford F-150 truck"}' `
    -ExpectContains "truck"

Test-Endpoint -Name "Parse vehicle: RV" `
    -Url "$BFF_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": "Class A motorhome RV"}' `
    -ExpectContains "rv"

Test-Endpoint -Name "Parse vehicle: sedan (default)" `
    -Url "$BFF_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": "Honda Civic sedan"}' `
    -ExpectContains "car"

Test-Endpoint -Name "Parse vehicle: empty (400)" `
    -Url "$BFF_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": ""}' `
    -ExpectStatus 400

Test-Endpoint -Name "Generate trip" `
    -Url "$BFF_URL/api/v1/generate-trip" `
    -Method "POST" `
    -Body '{"origin": "Denver, CO", "destination": "Las Vegas, NV", "interests": ["hiking"]}' `
    -ExpectContains "suggestions"

Test-Endpoint -Name "Generate trip: missing fields (400)" `
    -Url "$BFF_URL/api/v1/generate-trip" `
    -Method "POST" `
    -Body '{"origin": "", "destination": ""}' `
    -ExpectStatus 400

# ══════════════════════════════════════════════════════════
#  PHASE 6: C# AI Service Direct
# ══════════════════════════════════════════════════════════

Write-Header "C# AI Service (direct)"

Test-Endpoint -Name "Parse vehicle: SUV (direct)" `
    -Url "$CSHARP_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": "Toyota 4Runner SUV"}' `
    -ExpectContains "suv"

Test-Endpoint -Name "Parse vehicle: van (direct)" `
    -Url "$CSHARP_URL/api/v1/parse-vehicle" `
    -Method "POST" `
    -Body '{"description": "Mercedes Sprinter van"}' `
    -ExpectContains "van"

# ══════════════════════════════════════════════════════════
#  PHASE 7: Java Geospatial via BFF
# ══════════════════════════════════════════════════════════

Write-Header "Java Geospatial (via BFF proxy)"

# Java geospatial endpoints require MAPBOX_TOKEN / AZURE_MAPS_KEY.
# Without them the Java backend returns 500, which still proves the
# BFF proxy forwards correctly.  We accept 200 or 500 as a PASS,
# and only FAIL on 404/502 (which would indicate a proxy problem).

$geoExpectStatus = if ($env:MAPBOX_TOKEN) { 200 } else { 500 }
$geoNote = if ($env:MAPBOX_TOKEN) { "" } else { " (500 expected — MAPBOX_TOKEN not set)" }

Test-Endpoint -Name "Geocode via BFF$geoNote" `
    -Url "$BFF_URL/api/geocode?q=Denver" `
    -ExpectStatus $geoExpectStatus

Test-Endpoint -Name "Directions via BFF$geoNote" `
    -Url "$BFF_URL/api/directions?coords=-104.99,39.74;-115.17,36.11&profile=driving" `
    -ExpectStatus $geoExpectStatus

Test-Endpoint -Name "Search via BFF$geoNote" `
    -Url "$BFF_URL/api/search?query=gas+station&proximity=-104.99,39.74" `
    -ExpectStatus $geoExpectStatus

# ══════════════════════════════════════════════════════════
#  PHASE 8: Python Backend via BFF
# ══════════════════════════════════════════════════════════

Write-Header "Python Backend (via BFF proxy)"

Test-Endpoint -Name "Python /health via BFF" `
    -Url "$BFF_URL/api/health" `
    -ExpectContains "status"

Test-Endpoint -Name "Public trips via BFF" `
    -Url "$BFF_URL/api/public-trips" `
    -ExpectStatus 200

# ══════════════════════════════════════════════════════════
#  RESULTS SUMMARY
# ══════════════════════════════════════════════════════════

Write-Header "Test Results Summary"

$total = $passed + $failed + $skipped
Write-Host ""
Write-Host "  Total:   $total" -ForegroundColor White
Write-Host "  Passed:  $passed" -ForegroundColor Green
Write-Host "  Failed:  $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host ""

if ($failed -gt 0) {
    Write-Host "  Failed Tests:" -ForegroundColor Red
    foreach ($r in $results | Where-Object { $_.Status -eq "FAIL" }) {
        Write-Host "    - $($r.Name): $($r.Detail)" -ForegroundColor Red
    }
    Write-Host ""
}

# ── Teardown ──
if ($Teardown) {
    Write-Header "Tearing Down"
    Push-Location (Split-Path $PSScriptRoot -Parent)
    docker compose down 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
    Pop-Location
}

# ── Exit ──
if ($failed -gt 0) {
    Write-Host "  RESULT: SOME TESTS FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  RESULT: ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
