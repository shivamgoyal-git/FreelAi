import React, { useState, useEffect } from "react";
import EntitySelector, { EntitySelectorItem } from "./EntitySelector";
import { Plus, User } from "lucide-react";

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
  notes?: string;
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onSelectClient: (client: Client | null) => void;
  onCreateNewClientTrigger: () => void;
  // Trigger to force refresh the client list (e.g. after adding a new client)
  refreshTrigger?: number;
}

export default function ClientSelector({
  selectedClientId,
  onSelectClient,
  onCreateNewClientTrigger,
  refreshTrigger = 0,
}: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Fetch clients from database
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/clients?limit=100");
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [refreshTrigger]);

  // Load recently used client IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("freelai_recent_clients");
      if (stored) {
        setRecentIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent clients from localStorage", e);
    }
  }, [selectedClientId]);

  // Map clients to EntitySelectorItem structure
  const mappedItems: EntitySelectorItem[] = clients.map((client) => ({
    id: client._id,
    title: client.name,
    description: client.company || client.email || "",
    avatar: client.avatar,
    rawClient: client, // keep raw client object for easy selection
  }));

  // Reorder items: put recently used clients first
  const orderedItems = React.useMemo(() => {
    if (recentIds.length === 0) return mappedItems;

    const recentItems: EntitySelectorItem[] = [];
    const otherItems: EntitySelectorItem[] = [];

    mappedItems.forEach((item) => {
      if (recentIds.includes(item.id)) {
        // Tag recent items to show indicator
        recentItems.push({
          ...item,
          isRecent: true,
        });
      } else {
        otherItems.push(item);
      }
    });

    // Sort recent items in the order they appear in recentIds
    recentItems.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));

    return [...recentItems, ...otherItems];
  }, [mappedItems, recentIds]);

  const handleSelect = (item: EntitySelectorItem | null) => {
    if (item) {
      onSelectClient(item.rawClient);

      // Save to localStorage
      try {
        const updated = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 3);
        localStorage.setItem("freelai_recent_clients", JSON.stringify(updated));
        setRecentIds(updated);
      } catch (e) {
        console.error(e);
      }
    } else {
      onSelectClient(null);
    }
  };

  const renderItemCustom = (item: EntitySelectorItem, active: boolean, focused: boolean) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          background: focused
            ? "rgba(255, 255, 255, 0.06)"
            : active
            ? "rgba(99, 102, 241, 0.08)"
            : "transparent",
          transition: "background var(--dur-fast)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.title}
              style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: active ? "var(--primary)" : "var(--border-strong)",
                color: active ? "var(--text-on-primary)" : "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {item.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.title}
              </span>
              {item.isRecent && (
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    background: "rgba(255, 255, 255, 0.06)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Recent
                </span>
              )}
            </div>
            {item.description && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.description}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <EntitySelector
      label="Client *"
      items={orderedItems}
      selectedId={selectedClientId}
      placeholder="Select an existing client..."
      searchPlaceholder="Type name, company, or email to search..."
      loading={loading}
      emptyLabel="No matching client found."
      emptyActionLabel="+ Create New Client"
      onEmptyAction={onCreateNewClientTrigger}
      onSelect={handleSelect}
      renderItem={renderItemCustom}
    />
  );
}
