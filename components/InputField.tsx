"use client";

interface InputFieldProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
}

export default function InputField({
  input,
  setInput,
  handleSend,
}: InputFieldProps) {
  return (
    <footer className="p-4 bg-white border-t">
      <div className="max-w-5xl mx-auto flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </footer>
  );
}
