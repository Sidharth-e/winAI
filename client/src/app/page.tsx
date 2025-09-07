"use client";
import { useState, useEffect } from "react";

// Defines the structure for a single reminder object
interface Reminder {
  _id: string;
  title: string;
  message: string;
  time: string;
}

export default function Home() {
  // State management for the list of reminders and form inputs
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");

  // Fetch existing reminders from the API when the component mounts
  useEffect(() => {
    fetch("http://localhost:4000/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data))
      .catch(err => console.error("Failed to fetch reminders:", err)); // Basic error handling
  }, []);

  // Handles adding a new reminder
  const addReminder = async () => {
    // Prevents adding empty reminders
    if (!title || !message || !time) {
        alert("Please fill out all fields.");
        return;
    }
    
    try {
        const res = await fetch("http://localhost:4000/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, message, time }),
        });

        if (!res.ok) throw new Error("API call failed");

        const newReminder = await res.json();
        // Add the new reminder to the list and sort by time
        setReminders(prevReminders => 
            [...prevReminders, newReminder].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );

        // Clear input fields after successful submission
        setTitle("");
        setMessage("");
        setTime("");
    } catch (error) {
        console.error("Failed to add reminder:", error);
        alert("Could not add the reminder. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Page Header */}
          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              AI Agent Reminders 🤖
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Never forget an important task again.
            </p>
          </header>

          {/* Form Section to Add New Reminders */}
          <section className="bg-white p-6 rounded-2xl shadow-lg mb-12">
            <h2 className="text-xl font-bold mb-5 text-gray-800">Add a New Reminder</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <input
                  type="text"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="md:col-span-2 w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 transition"
                />
                <button
                  onClick={addReminder}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </section>

          {/* Section to Display Upcoming Reminders */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Upcoming Reminders
            </h2>
            {reminders.length > 0 ? (
              <ul className="space-y-4">
                {reminders.map((r) => (
                  <li
                    key={r._id}
                    className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row justify-between sm:items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="mb-3 sm:mb-0">
                      <p className="font-bold text-lg text-blue-700">{r.title}</p>
                      <p className="text-gray-600">{r.message}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-center">
                      {new Date(r.time).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 px-6 bg-white rounded-2xl shadow-lg">
                <p className="text-gray-500">You have no upcoming reminders. ✨</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}