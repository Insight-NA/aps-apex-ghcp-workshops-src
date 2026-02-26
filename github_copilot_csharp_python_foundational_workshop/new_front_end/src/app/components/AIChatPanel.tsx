import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Car, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChatMessage, TripData } from '../types';
import { generateTripFromPrompt } from '../utils/tripGenerator';

interface AIChatPanelProps {
  onTripCreated: (trip: TripData) => void;
}

export function AIChatPanel({ onTripCreated }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Road Trip Planner. Tell me where you'd like to go, and I'll help you plan an amazing journey across the US! Try saying something like 'Plan a trip from New York to Los Angeles' or 'Road trip from Miami to Seattle with scenic stops'.",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const tripData = generateTripFromPrompt(input);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! I've created a road trip from ${tripData.origin.name} to ${tripData.destination.name}. Here's what I planned:\n\n🚗 Total Distance: ${tripData.totalMiles} miles\n💰 Estimated Gas Cost: $${tripData.gasCost.toFixed(2)}\n🛑 Stops: ${tripData.stops.length} waypoints\n📍 Points of Interest: ${tripData.pois.length} locations\n\nYou can see the route on the map and adjust the details in the side panel. Would you like to modify anything?`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      onTripCreated(tripData);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-96 bg-white border-r border-zinc-200 flex flex-col">
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-zinc-900">AI Trip Assistant</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 text-zinc-900 rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your dream road trip..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Plan a scenic trip from San Francisco to Seattle")}
            className="text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            SF to Seattle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Road trip from Chicago to Miami with beach stops")}
            className="text-xs"
          >
            <Car className="w-3 h-3 mr-1" />
            Chicago to Miami
          </Button>
        </div>
      </div>
    </div>
  );
}