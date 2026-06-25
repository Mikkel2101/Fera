CREATE TABLE IF NOT EXISTS pending_order_automations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid        REFERENCES orders(id),
  payload    jsonb       NOT NULL,
  status     text        NOT NULL DEFAULT 'pending',
  attempts   int         NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
