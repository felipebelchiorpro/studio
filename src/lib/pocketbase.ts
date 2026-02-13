
import PocketBase from 'pocketbase';

// Use the provided URL
const pb = new PocketBase('https://pb.darkstoresuplementos.com/');

// Disable auto-cancellation to avoid issues with React strict mode double-invocations
pb.autoCancellation(false);

export { pb };
