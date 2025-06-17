# StreamAX Database Schema

Complete database schema documentation for StreamAX using Supabase PostgreSQL.

## 🗄️ Overview

StreamAX uses Supabase as the backend database with the following key features:
- **Row Level Security (RLS)** enabled on all tables
- **Real-time subscriptions** for live updates
- **Automated triggers** for user management
- **Performance indexes** for optimal queries
- **Backup and monitoring** tables

## 📊 Core Tables

### 1. users
User profiles and package management.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  package_type text CHECK (package_type IN ('starter', 'creator', 'pro')),
  package_expires_at timestamptz,
  streams_allowed integer DEFAULT 0,
  streams_active integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Columns:**
- `id`: UUID, references auth.users
- `email`: User email address
- `role`: User role (admin/user)
- `package_type`: Active package (starter/creator/pro)
- `package_expires_at`: Package expiration timestamp
- `streams_allowed`: Maximum concurrent streams
- `streams_active`: Current active streams
- `created_at`: Account creation timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `email`

### 2. stream_sessions
Active streaming sessions with container tracking.

```sql
CREATE TABLE stream_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  container_id text,
  rtmp_url text NOT NULL,
  video_source text NOT NULL,
  status text DEFAULT 'stopped' CHECK (status IN ('starting', 'running', 'stopping', 'stopped', 'error')),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  stopped_at timestamptz
);
```

**Columns:**
- `id`: Unique session identifier
- `user_id`: Reference to user
- `container_id`: Docker container ID
- `rtmp_url`: YouTube RTMP streaming URL
- `video_source`: Video file path or URL
- `status`: Current session status
- `created_at`: Session creation time
- `started_at`: Stream start time
- `stopped_at`: Stream stop time

**Indexes:**
- `idx_stream_sessions_user_id` on `user_id`
- `idx_stream_sessions_status` on `status`
- `idx_stream_sessions_created_at` on `created_at`
- `idx_stream_sessions_status_created` on `(status, created_at)`

### 3. stream_requests
Stream approval workflow (if using admin approval).

```sql
CREATE TABLE stream_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_source text NOT NULL,
  video_url text,
  rtmp_url text NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'streaming', 'stopped')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  started_at timestamptz,
  stopped_at timestamptz
);
```

**Columns:**
- `id`: Unique request identifier
- `user_id`: Reference to user
- `video_source`: Video file or URL
- `video_url`: Original video URL
- `rtmp_url`: YouTube RTMP URL
- `title`: Stream title
- `description`: Stream description
- `status`: Request status
- `admin_notes`: Admin feedback
- `created_at`: Request creation time
- `approved_at`: Admin approval time
- `started_at`: Stream start time
- `stopped_at`: Stream stop time

**Indexes:**
- `idx_stream_requests_user_id` on `user_id`
- `idx_stream_requests_status` on `status`
- `idx_stream_requests_created_at` on `created_at`

## 📈 Monitoring Tables

### 4. user_activities
User action tracking and audit logs.

```sql
CREATE TABLE user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text,
  metadata jsonb,
  ip text,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

**Columns:**
- `id`: Unique activity identifier
- `user_id`: Reference to user (nullable for system actions)
- `action`: Action performed (login, stream_start, etc.)
- `resource`: Resource affected
- `metadata`: Additional action data (JSON)
- `ip`: User IP address
- `user_agent`: User browser/client info
- `timestamp`: Action timestamp
- `created_at`: Record creation time

**Indexes:**
- `idx_user_activities_user_id` on `user_id`
- `idx_user_activities_timestamp` on `timestamp`

### 5. error_logs
Application error tracking.

```sql
CREATE TABLE error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  url text,
  line integer,
  column integer,
  user_agent text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  timestamp timestamptz NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context jsonb,
  ip text,
  created_at timestamptz DEFAULT now()
);
```

**Columns:**
- `id`: Unique error identifier
- `message`: Error message
- `stack`: Error stack trace
- `url`: URL where error occurred
- `line`: Line number (for JS errors)
- `column`: Column number (for JS errors)
- `user_agent`: User browser info
- `user_id`: Associated user (if any)
- `timestamp`: Error occurrence time
- `severity`: Error severity level
- `context`: Additional error context (JSON)
- `ip`: User IP address
- `created_at`: Record creation time

**Indexes:**
- `idx_error_logs_timestamp` on `timestamp`
- `idx_error_logs_severity` on `severity`

### 6. performance_metrics
System performance monitoring.

```sql
CREATE TABLE performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value numeric NOT NULL,
  unit text DEFAULT 'ms',
  timestamp timestamptz NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  page text,
  context jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Columns:**
- `id`: Unique metric identifier
- `name`: Metric name (page_load, api_response, etc.)
- `value`: Metric value
- `unit`: Value unit (ms, bytes, etc.)
- `timestamp`: Measurement timestamp
- `user_id`: Associated user (if any)
- `page`: Page/endpoint measured
- `context`: Additional metric context (JSON)
- `created_at`: Record creation time

**Indexes:**
- `idx_performance_metrics_name` on `name`
- `idx_performance_metrics_timestamp` on `timestamp`

### 7. backup_metadata
Database backup tracking.

```sql
CREATE TABLE backup_metadata (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  size bigint,
  tables text[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  file_path text,
  checksum text,
  s3_bucket text,
  s3_key text
);
```

**Columns:**
- `id`: Backup identifier
- `created_at`: Backup creation time
- `size`: Backup file size in bytes
- `tables`: List of backed up tables
- `status`: Backup status
- `file_path`: Local backup file path
- `checksum`: File integrity checksum
- `s3_bucket`: S3 bucket (if using cloud storage)
- `s3_key`: S3 object key

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### User Data Access
```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id);
```

### Admin Access
```sql
-- Admins can read all data
CREATE POLICY "Admins can read all data"
  ON users FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### Stream Sessions
```sql
-- Users can manage their own sessions
CREATE POLICY "Users can read own sessions"
  ON stream_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON stream_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
```

## ⚡ Functions

### User Management Functions

#### handle_new_user()
Automatically creates user profile when auth user is created.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, role, streams_allowed, streams_active)
  VALUES (NEW.id, NEW.email, 'user', 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### increment_user_streams(user_id uuid)
Safely increments user's active stream count.

```sql
CREATE OR REPLACE FUNCTION increment_user_streams(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET streams_active = LEAST(streams_active + 1, streams_allowed)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### decrement_user_streams(user_id uuid)
Safely decrements user's active stream count.

```sql
CREATE OR REPLACE FUNCTION decrement_user_streams(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET streams_active = GREATEST(streams_active - 1, 0)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### cleanup_orphaned_streams()
Cleans up streams without running containers.

```sql
CREATE OR REPLACE FUNCTION cleanup_orphaned_streams()
RETURNS integer AS $$
DECLARE
  cleanup_count integer := 0;
BEGIN
  -- Update streams that have been "starting" for more than 5 minutes
  UPDATE stream_sessions 
  SET status = 'error'
  WHERE status = 'starting' 
    AND created_at < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Reset user active stream counts
  UPDATE users 
  SET streams_active = (
    SELECT COUNT(*)
    FROM stream_sessions 
    WHERE stream_sessions.user_id = users.id 
      AND stream_sessions.status IN ('running', 'starting')
  );
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔄 Triggers

### User Creation Trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 📊 Useful Queries

### Active Users with Packages
```sql
SELECT 
  u.email,
  u.package_type,
  u.package_expires_at,
  u.streams_active,
  u.streams_allowed,
  CASE 
    WHEN u.package_expires_at > NOW() THEN 'Active'
    ELSE 'Expired'
  END as package_status
FROM users u
WHERE u.package_type IS NOT NULL
ORDER BY u.package_expires_at DESC;
```

### Stream Statistics
```sql
SELECT 
  u.email,
  COUNT(ss.id) as total_sessions,
  COUNT(CASE WHEN ss.status = 'running' THEN 1 END) as active_sessions,
  AVG(EXTRACT(EPOCH FROM (ss.stopped_at - ss.started_at))/60) as avg_duration_minutes
FROM users u
LEFT JOIN stream_sessions ss ON u.id = ss.user_id
GROUP BY u.id, u.email
ORDER BY total_sessions DESC;
```

### Error Summary
```sql
SELECT 
  DATE(created_at) as error_date,
  severity,
  COUNT(*) as error_count
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), severity
ORDER BY error_date DESC, severity;
```

### Performance Metrics
```sql
SELECT 
  name,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as sample_count
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY name
ORDER BY avg_value DESC;
```

## 🔧 Maintenance

### Regular Cleanup
```sql
-- Clean old error logs (older than 30 days)
DELETE FROM error_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean old performance metrics (older than 7 days)
DELETE FROM performance_metrics 
WHERE created_at < NOW() - INTERVAL '7 days';

-- Clean old user activities (older than 90 days)
DELETE FROM user_activities 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Index Maintenance
```sql
-- Reindex tables for optimal performance
REINDEX TABLE users;
REINDEX TABLE stream_sessions;
REINDEX TABLE stream_requests;
```

### Backup Commands
```sql
-- Create backup of all user data
COPY (
  SELECT * FROM users 
  WHERE created_at >= NOW() - INTERVAL '1 day'
) TO '/tmp/users_backup.csv' WITH CSV HEADER;

-- Create backup of stream sessions
COPY (
  SELECT * FROM stream_sessions 
  WHERE created_at >= NOW() - INTERVAL '1 day'
) TO '/tmp/sessions_backup.csv' WITH CSV HEADER;
```

## 📞 Support

For database-related issues:
- Check Supabase dashboard for real-time metrics
- Monitor slow queries in the performance tab
- Review RLS policies if access issues occur
- Contact: database@streamax.com

---

**StreamAX Database Schema** - Complete PostgreSQL schema for production streaming service