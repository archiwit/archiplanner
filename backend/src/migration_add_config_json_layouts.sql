-- Migration to add config_json to event_layouts
ALTER TABLE event_layouts ADD COLUMN config_json JSON NULL AFTER materiales_globales;
