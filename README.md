#### Quick Start: PowerSync+Supabase Local Development

This demo allows you to quickstart a local PowerSync and Supabase services.

Copy the environment variables template file

```bash
cp .env.template .env.local
```

Start the Supabase project

```bash
supabase start
```

Run the PowerSync service with

```bash
docker run \
-p 8080:8080 \
-e POWERSYNC_CONFIG_B64=$(base64 -i ./powersync.yaml) \
-e POWERSYNC_SYNC_RULES_B64=$(base64 -i ./sync-rules.yaml) \
--env-file ./.env.local \
--network supabase_network_expo-supabase-todo \
--name expo-powersync journeyapps/powersync-service:latest
```

Resume

```bash
docker restart expo-powersync
```

## Supabase Studio

http://127.0.0.1:54323/project/default
