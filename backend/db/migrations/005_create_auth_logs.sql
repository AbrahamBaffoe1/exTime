CREATE TABLE IF NOT EXISTS auth_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('LOGIN', 'LOGOUT')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_timestamp ON auth_logs(timestamp);
