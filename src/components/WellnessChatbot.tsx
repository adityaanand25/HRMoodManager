import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, Sparkles, Heart, TrendingUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

interface WellnessChatbotProps {
  className?: string;
}

export const WellnessChatbot: React.FC<WellnessChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        message: "Hi! I'm your AI Wellness Assistant. I can help you with stress management, work-life balance, mental health resources, and team wellness insights. How can I assist you today?",
        timestamp: new Date(),
        suggestions: [
          "I'm feeling stressed",
          "Team wellness tips",
          "Mental health resources",
          "Work-life balance advice"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const message = userMessage.toLowerCase();
    let response = '';
    let suggestions: string[] = [];

    if (message.includes('stress') || message.includes('overwhelmed') || message.includes('anxious')) {
      response = "I understand you're feeling stressed. Here are some immediate techniques that can help:\n\n• Take 5 deep breaths (4 seconds in, 6 seconds out)\n• Try the 5-4-3-2-1 grounding technique\n• Take a short walk or stretch\n• Practice progressive muscle relaxation\n\nWould you like me to guide you through any of these techniques?";
      suggestions = ["Guide me through breathing", "5-4-3-2-1 technique", "Find meditation resources", "Talk to someone"];
    } else if (message.includes('team') || message.includes('colleagues') || message.includes('workplace')) {
      response = "Great question about team wellness! Here are some evidence-based strategies:\n\n• Regular team check-ins focused on wellbeing\n• Encourage open communication about workload\n• Promote flexible work arrangements\n• Organize team wellness activities\n• Create psychological safety in meetings\n\nWhich area would you like to explore further?";
      suggestions = ["Team activities ideas", "Communication tips", "Workload management", "Building trust"];
    } else if (message.includes('mental health') || message.includes('depression') || message.includes('therapy')) {
      response = "Mental health is crucial for overall wellbeing. Here are some resources and tips:\n\n• Employee Assistance Program (EAP) - Free confidential counseling\n• Mental Health First Aid resources\n• Mindfulness and meditation apps\n• Professional therapy options\n• Peer support groups\n\n⚠️ If you're experiencing crisis thoughts, please contact emergency services or a crisis hotline immediately.";
      suggestions = ["Find a therapist", "Crisis resources", "Mindfulness apps", "EAP information"];
    } else if (message.includes('work-life') || message.includes('balance') || message.includes('boundaries')) {
      response = "Work-life balance is essential for long-term wellness. Here are some strategies:\n\n• Set clear boundaries between work and personal time\n• Use the 'shutdown ritual' at end of workday\n• Prioritize tasks using the Eisenhower Matrix\n• Schedule personal time like important meetings\n• Practice saying 'no' to non-essential tasks\n\nWhat specific area of work-life balance challenges you most?";
      suggestions = ["Setting boundaries", "Time management", "Saying no effectively", "After-work routine"];
    } else if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
      response = "Quality sleep is fundamental to wellbeing. Here are sleep hygiene tips:\n\n• Maintain consistent sleep schedule\n• Create a relaxing bedtime routine\n• Limit screen time 1 hour before bed\n• Keep bedroom cool, dark, and quiet\n• Avoid caffeine 6 hours before bedtime\n• Try progressive muscle relaxation\n\nPoor sleep affects mood, productivity, and health. Would you like specific techniques for better sleep?";
      suggestions = ["Bedtime routine ideas", "Relaxation techniques", "Sleep environment tips", "When to see a doctor"];
    } else if (message.includes('manager') || message.includes('boss') || message.includes('leadership')) {
      response = "Having supportive leadership is crucial for employee wellbeing. Here are tips for managers:\n\n• Regular one-on-one check-ins\n• Practice active listening\n• Recognize and appreciate good work\n• Provide growth opportunities\n• Be transparent about company changes\n• Model healthy work habits\n\nAre you looking for advice as a manager or about working with your manager?";
      suggestions = ["Managing my team", "Talking to my manager", "Leadership resources", "Feedback techniques"];
    } else {
      response = "I'm here to help with your wellness and mental health questions. I can provide guidance on:\n\n• Stress management techniques\n• Work-life balance strategies\n• Mental health resources\n• Team wellness initiatives\n• Sleep and energy optimization\n• Communication and boundary setting\n\nWhat specific area would you like help with?";
      suggestions = ["Stress relief", "Mental health", "Team wellness", "Work-life balance"];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot size={24} />
            <div>
              <h3 className="font-semibold">Wellness Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center space-x-2 mb-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'bot' && <Bot size={16} className="text-blue-600" />}
                  {message.type === 'user' && <User size={16} className="text-gray-600" />}
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`p-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
                
                {/* Suggestions */}
                {message.type === 'bot' && message.suggestions && (
                  <div className="mt-2 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="block w-full text-left text-xs p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about wellness, stress, or mental health..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => handleSendMessage("I'm feeling stressed")}
              className="flex items-center space-x-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full hover:bg-red-100 transition-colors"
            >
              <Heart size={12} />
              <span>Stressed</span>
            </button>
            <button
              onClick={() => handleSendMessage("Team wellness tips")}
              className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              <TrendingUp size={12} />
              <span>Team Tips</span>
            </button>
            <button
              onClick={() => handleSendMessage("Mental health resources")}
              className="flex items-center space-x-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors"
            >
              <Sparkles size={12} />
              <span>Resources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
