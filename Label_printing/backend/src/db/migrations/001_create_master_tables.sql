-- ============================================
-- MIGRATION 001: Create Master Tables
-- ============================================

-- TABLE: Product
CREATE TABLE IF NOT EXISTS Product (
  Product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Product_name VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Capacities
CREATE TABLE IF NOT EXISTS Capacities (
  Capacity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Capacity_value VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Model_Number
CREATE TABLE IF NOT EXISTS Model_Number (
  Model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Model_name VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Label_Config
CREATE TABLE IF NOT EXISTS Label_Config (
  Config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Company_name VARCHAR(255),
  Logo_url VARCHAR(500),
  Made_in_value VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Print_Format
CREATE TABLE IF NOT EXISTS Print_Format (
  Format_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Format_name VARCHAR(255) NOT NULL UNIQUE,
  Dimension VARCHAR(255),
  Label_per_page INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR MASTER TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_product_active ON Product(is_active);
CREATE INDEX IF NOT EXISTS idx_product_name ON Product(Product_name);
CREATE INDEX IF NOT EXISTS idx_capacities_active ON Capacities(is_active);
CREATE INDEX IF NOT EXISTS idx_capacities_value ON Capacities(Capacity_value);
CREATE INDEX IF NOT EXISTS idx_model_active ON Model_Number(is_active);
CREATE INDEX IF NOT EXISTS idx_model_name ON Model_Number(Model_name);
CREATE INDEX IF NOT EXISTS idx_config_active ON Label_Config(is_active);
CREATE INDEX IF NOT EXISTS idx_format_active ON Print_Format(Format_id);

COMMIT;
