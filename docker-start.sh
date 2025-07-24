docker run \
-p 8080:8080 \
-e POWERSYNC_CONFIG_B64=$(base64 -i ./powersync.yaml) \
-e POWERSYNC_SYNC_RULES_B64=$(base64 -i ./sync-rules.yaml) \
--env-file ./.env.local \
--network supabase_network_expo-supabase-todo \
--name expo-powersync journeyapps/powersync-service:latest