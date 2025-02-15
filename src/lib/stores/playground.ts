import { storage } from "@sveltelegos-blue/svelte-legos";
import { writable } from "svelte/store";

export const counterCount = storage(writable(0), 'counter');