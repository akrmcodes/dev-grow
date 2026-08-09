import type { UIMessage } from "ai";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Mode } from "@/lib/prompts";

const DB_NAME = "devgrow-history";
const STORE_NAME = "conversations";
const MAX_CONVERSATIONS = 50;

export type StoredConversation = {
  id: string;
  title: string;
  messages: UIMessage[];
  mode: Mode;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMetadata = Pick<
  StoredConversation,
  "id" | "title" | "createdAt" | "updatedAt" | "mode"
>;

interface DevGrowHistoryDB extends DBSchema {
  conversations: {
    key: string;
    value: StoredConversation;
    indexes: { "by-updatedAt": string };
  };
}

let dbPromise: Promise<IDBPDatabase<DevGrowHistoryDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<DevGrowHistoryDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-updatedAt", "updatedAt");
      },
    });
  }

  return dbPromise;
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

export function generateConversationTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) {
    return "Untitled";
  }

  const text = getMessageText(firstUser).trim();
  if (!text) {
    return "Untitled";
  }

  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

async function enforceConversationLimit(
  db: IDBPDatabase<DevGrowHistoryDB>,
): Promise<void> {
  const all = await db.getAllFromIndex(STORE_NAME, "by-updatedAt");

  if (all.length <= MAX_CONVERSATIONS) {
    return;
  }

  const excess = all.length - MAX_CONVERSATIONS;
  const toDelete = all.slice(0, excess);

  for (const conversation of toDelete) {
    await db.delete(STORE_NAME, conversation.id);
  }
}

export async function saveConversation(
  data: Omit<StoredConversation, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): Promise<StoredConversation> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.get(STORE_NAME, data.id);

  const record: StoredConversation = {
    ...data,
    createdAt: existing?.createdAt ?? data.createdAt ?? now,
    updatedAt: now,
  };

  await db.put(STORE_NAME, record);
  await enforceConversationLimit(db);

  return record;
}

export async function loadConversation(
  id: string,
): Promise<StoredConversation | null> {
  const db = await getDb();
  const record = await db.get(STORE_NAME, id);
  return record ?? null;
}

export async function listConversations(): Promise<ConversationMetadata[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE_NAME, "by-updatedAt");

  return all
    .map(({ id, title, createdAt, updatedAt, mode }) => ({
      id,
      title,
      createdAt,
      updatedAt,
      mode,
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearAllConversations(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
