"use client";

import { useState } from "react";

export default function DebugUsersPage() {
    const [userResult, setUserResult] = useState<any>(null);
    const [allUsersResult, setAllUsersResult] = useState<any>(null);
    const [testUsername, setTestUsername] = useState("testuser");
    const [loading, setLoading] = useState(false);

    const testGetUser = async (username: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${username}`);
            const data = await response.json();
            setUserResult({ status: response.status, data });
        } catch (error) {
            const err = error as Error;
            setUserResult({ error: err.message });
        }
        setLoading(false);
    };

    const testGetAllUsers = async () => {
        setLoading(true);
        try {
            // Test if we can access the database
            const response = await fetch(`/api/users/random`);
            const data = await response.json();
            setAllUsersResult({ status: response.status, data });
        } catch (error) {
            const err = error as Error;
            setAllUsersResult({ error: err.message });
        }
        setLoading(false);
    };

    const createTestUser = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: testUsername,
                    password: "testpassword123",
                    name: "Test User",
                }),
            });
            const data = await response.json();
            setUserResult({ status: response.status, data, action: "create" });
        } catch (error) {
            const err = error as Error;
            setUserResult({ error: err.message, action: "create" });
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "monospace" }}>
            <h1>Debug Users Page</h1>
            
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    value={testUsername}
                    onChange={(e) => setTestUsername(e.target.value)}
                    placeholder="Enter username to test"
                    style={{ padding: "8px", marginRight: "10px" }}
                />
                <button 
                    onClick={() => testGetUser(testUsername)}
                    disabled={loading}
                    style={{ padding: "8px 16px", marginRight: "10px" }}
                >
                    Test Get User
                </button>
                <button 
                    onClick={createTestUser}
                    disabled={loading}
                    style={{ padding: "8px 16px", marginRight: "10px" }}
                >
                    Create Test User
                </button>
                <button 
                    onClick={testGetAllUsers}
                    disabled={loading}
                    style={{ padding: "8px 16px" }}
                >
                    Test Random Users API
                </button>
            </div>

            {loading && <p>Loading...</p>}

            {userResult && (
                <div style={{ marginBottom: "20px" }}>
                    <h3>User API Result:</h3>
                    <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
                        {JSON.stringify(userResult, null, 2)}
                    </pre>
                </div>
            )}

            {allUsersResult && (
                <div style={{ marginBottom: "20px" }}>
                    <h3>Random Users API Result:</h3>
                    <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
                        {JSON.stringify(allUsersResult, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                <h3>Instructions:</h3>
                <p>1. First try &quot;Test Random Users API&quot; to see if database connection works</p>
                <p>2. Try &quot;Test Get User&quot; with different usernames to see if any exist</p>
                <p>3. If no users exist, try &quot;Create Test User&quot; to create one</p>
                <p>4. Then navigate to /{testUsername} to test the profile page</p>
            </div>
        </div>
    );
}
