-- ============================================
-- MIGRATION 003: Create Label and Report Tables
-- ============================================

-- TABLE: Label
CREATE TABLE IF NOT EXISTS Label (
  Label_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Product_id UUID REFERENCES Product(Product_id),
  Capacity_id UUID REFERENCES Capacities(Capacity_id),
  Model_id UUID REFERENCES Model_Number(Model_id),
  Serial_id UUID UNIQUE REFERENCES Serial_Number(Serial_id),
  Manufacturing_code VARCHAR(255),
  SSN VARCHAR(255),
  QR_data TEXT,
  Duplicate_count INT DEFAULT 0,
  format_id UUID REFERENCES Print_Format(Format_id),
  Config_id UUID REFERENCES Label_Config(Config_id),
  Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Is_deleted BOOLEAN DEFAULT false,
  Deleted_at TIMESTAMP
);

-- TABLE: Overall_Event_Report
CREATE TABLE IF NOT EXISTS Overall_Event_Report (
  Overall_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Event_number VARCHAR(50) NOT NULL UNIQUE,
  Number_of_label_printed INT,
  Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Report
CREATE TABLE IF NOT EXISTS Report (
  Report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Overall_report_id UUID REFERENCES Overall_Event_Report(Overall_report_id),
  Product_name VARCHAR(255),
  Capacity_name VARCHAR(255),
  Model_name VARCHAR(255),
  Serial_number VARCHAR(50),
  Manufacturing_code VARCHAR(255),
  SSN VARCHAR(255),
  Qr_data TEXT,
  Duplicate_count INT,
  Is_reprinted BOOLEAN DEFAULT false,
  Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR LABEL AND REPORT TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_label_product ON Label(Product_id);
CREATE INDEX IF NOT EXISTS idx_label_capacity ON Label(Capacity_id);
CREATE INDEX IF NOT EXISTS idx_label_model ON Label(Model_id);
CREATE INDEX IF NOT EXISTS idx_label_serial ON Label(Serial_id);
CREATE INDEX IF NOT EXISTS idx_label_config ON Label(Config_id);
CREATE INDEX IF NOT EXISTS idx_label_format ON Label(format_id);
CREATE INDEX IF NOT EXISTS idx_label_deleted ON Label(Is_deleted);
CREATE INDEX IF NOT EXISTS idx_label_created ON Label(Created_at);

CREATE INDEX IF NOT EXISTS idx_report_event ON Report(Overall_report_id);
CREATE INDEX IF NOT EXISTS idx_report_serial ON Report(Serial_number);
CREATE INDEX IF NOT EXISTS idx_report_reprinted ON Report(Is_reprinted);
CREATE INDEX IF NOT EXISTS idx_report_created ON Report(Created_at);

CREATE INDEX IF NOT EXISTS idx_overall_event_number ON Overall_Event_Report(Event_number);
CREATE INDEX IF NOT EXISTS idx_overall_created ON Overall_Event_Report(Created_at);

COMMIT;
