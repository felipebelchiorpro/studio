
"use client";

import React, { useEffect, useState } from 'react';
import { pb } from '@/lib/pocketbase';

export default function DebugProductsClient() {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function load() {
            try {
                // Clear auth to ensure public guest access testing
                // pb.authStore.clear(); 
                // Don't clear automatically, let's see what happens with current state first

                const list = await pb.collection('products').getList(1, 10, {
                    expand: 'category,brand'
                });
                setResult(list);
            } catch (err: any) {
                console.error("Debug Error:", err);
                setError({
                    message: err.message,
                    status: err.status,
                    data: err.data,
                    isAbort: err.isAbort
                });
            }
        }
        load();
    }, []);

    return (
        <div className="p-10 bg-white text-black font-mono">
            <h1 className="text-xl font-bold mb-4">Debug Public Products</h1>

            <div className="mb-4 p-4 border rounded bg-gray-100">
                <strong>Auth Token Present:</strong> {pb.authStore.isValid ? "YES" : "NO"} <br />
                <strong>Auth Model:</strong> {pb.authStore.model ? JSON.stringify(pb.authStore.model.email) : "None"}
            </div>

            {error && (
                <div className="mb-4 p-4 border rounded bg-red-100 text-red-700">
                    <h2 className="font-bold">Error Occurred:</h2>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {result && (
                <div className="mb-4 p-4 border rounded bg-green-100 text-green-800">
                    <h2 className="font-bold">Success! Found {result.totalItems} items.</h2>
                    <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(result.items, null, 2)}</pre>
                </div>
            )}

            <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
            <button className="ml-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => { pb.authStore.clear(); window.location.reload(); }}>Clear Auth & Reload</button>
        </div>
    );
}
