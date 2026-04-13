-- Migration: Add categoria to gastos
ALTER TABLE gastos ADD COLUMN categoria VARCHAR(50) DEFAULT 'General' AFTER item_id;
