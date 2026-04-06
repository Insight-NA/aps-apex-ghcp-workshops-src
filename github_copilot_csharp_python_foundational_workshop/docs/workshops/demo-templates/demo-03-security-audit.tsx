/**
 * Demo 3 — Security and Privacy Awareness
 *
 * INSTRUCTIONS:
 * 1. Open this file in VS Code.
 * 2. There are THREE security issues in this file.
 * 3. Use Copilot Chat (/fix or Cmd+I) to identify and fix each one.
 * 4. After fixing, delete this demo file.
 *
 * SECURITY ISSUES TO FIND:
 *   Issue 1: Hardcoded API Key
 *   Issue 2: Direct external API call (bypassing backend proxy)
 *   Issue 3: XSS vulnerability
 */

import React, { useState, useEffect } from 'react';

// ❌ ISSUE 1: Hardcoded API key — should use environment variable or backend proxy
const MAPBOX_TOKEN = 'sk.eyJ1IjoiZXhhbXBsZS1kZXYiLCJhIjoiY2xhYmNkMTIzIn0.fake_secret_token_123';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
}

// ❌ ISSUE 2: Direct API call — should go through backend proxy at /api/search
async function searchPlaces(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  return data.features.map((f: any) => ({
    id: f.id,
    name: f.place_name,
    description: f.text,
    coordinates: f.center,
  }));
}

const InsecureSearchComponent: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query.length > 2) {
      searchPlaces(query).then(setResults);
    }
  }, [query]);

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="Search places..."
      />
      <ul className="mt-4 space-y-2">
        {results.map((result) => (
          <li key={result.id} className="p-2 border rounded">
            <h3 className="font-bold">{result.name}</h3>
            {/* ❌ ISSUE 3: XSS vulnerability — dangerouslySetInnerHTML with user data */}
            <div dangerouslySetInnerHTML={{ __html: result.description }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsecureSearchComponent;
