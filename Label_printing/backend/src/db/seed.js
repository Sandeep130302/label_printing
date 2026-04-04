import pool from '../config/database.js';

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // 1. INSERT SAMPLE PRODUCTS
    // ============================================
    console.log('📦 Inserting Products...');
    const productsResult = await client.query(`
      INSERT INTO Product (Product_name, is_active)
      VALUES 
        ('Coconut Oil 500ml', true),
        ('Coconut Oil 1L', true),
        ('Almond Oil 250ml', true),
        ('Mustard Oil 1L', true),
        ('Groundnut Oil 2L', true)
      RETURNING product_id, product_name;
    `);
    const products = productsResult.rows;
    console.log(`✓ Inserted ${products.length} products\n`);

    // ============================================
    // 2. INSERT SAMPLE CAPACITIES
    // ============================================
    console.log('📏 Inserting Capacities...');
    const capacitiesResult = await client.query(`
      INSERT INTO Capacities (Capacity_value, is_active)
      VALUES 
        ('250ml', true),
        ('500ml', true),
        ('1L', true),
        ('2L', true),
        ('5L', true)
      RETURNING capacity_id, capacity_value;
    `);
    const capacities = capacitiesResult.rows;
    console.log(`✓ Inserted ${capacities.length} capacities\n`);

    // ============================================
    // 3. INSERT SAMPLE MODELS
    // ============================================
    console.log('🏷️ Inserting Models...');
    const modelsResult = await client.query(`
      INSERT INTO Model_Number (Model_name, is_active)
      VALUES 
        ('COCONUT-2024-A1', true),
        ('ALMOND-2024-B2', true),
        ('MUSTARD-2024-C3', true),
        ('GROUNDNUT-2024-D4', true),
        ('SESAME-2024-E5', true)
      RETURNING model_id, model_name;
    `);
    const models = modelsResult.rows;
    console.log(`✓ Inserted ${models.length} models\n`);

    // ============================================
    // 4. INSERT SAMPLE PRINT FORMATS
    // ============================================
    console.log('📄 Inserting Print Formats...');
    const formatsResult = await client.query(`
      INSERT INTO Print_Format (Format_name, Dimension, Label_per_page)
      VALUES 
        ('Standard A4', '210x297mm', 6),
        ('Small A5', '148x210mm', 12),
        ('Compact 4x6', '101x152mm', 4),
        ('Large Sticker', '300x200mm', 2)
      RETURNING format_id, format_name;
    `);
    const formats = formatsResult.rows;
    console.log(`✓ Inserted ${formats.length} print formats\n`);

    // ============================================
    // 5. INSERT SAMPLE LABEL CONFIG
    // ============================================
    console.log('🏢 Inserting Label Config...');
    const configResult = await client.query(`
      INSERT INTO Label_Config (Company_name, Logo_url, Made_in_value, is_active)
      VALUES 
        ('JR TechLabs Pvt Ltd', 'https://example.com/logo.png', 'MADE IN INDIA', true),
        ('Premium Oils Co', 'https://example.com/logo2.png', 'MADE IN INDIA', true)
      RETURNING config_id, company_name;
    `);
    const configs = configResult.rows;
    console.log(`✓ Inserted ${configs.length} label configs\n`);

    // ============================================
    // 6. INSERT SAMPLE SERIAL COUNTERS
    // ============================================
    console.log('🔢 Inserting Serial Counters...');
    const counterResult = await client.query(`
      INSERT INTO Serial_Counter (Financial_year_start, Current_counter, Next_reset, Is_active)
      VALUES 
        (2026, 0, 2027, true),
        (2025, 500, 2026, true)
      RETURNING counter_id, financial_year_start, current_counter;
    `);
    const counters = counterResult.rows;
    console.log(`✓ Inserted ${counters.length} serial counters`);
    console.log(`  Counter 1 ID: ${counters[0].counter_id}`);
    console.log(`  Counter 2 ID: ${counters[1].counter_id}\n`);

    // ============================================
    // 7. INSERT SAMPLE SERIAL NUMBERS (FIXED)
    // ============================================
    console.log('📍 Inserting Serial Numbers...');
    const serialResult = await client.query(`
      INSERT INTO Serial_Number (Serial_number, counter_id, Is_used, Is_active)
      VALUES 
        ('2026001', $1::uuid, false, true),
        ('2026002', $1::uuid, false, true),
        ('2026003', $1::uuid, false, true),
        ('2026004', $1::uuid, false, true),
        ('2026005', $1::uuid, false, true),
        ('2025501', $2::uuid, true, true),
        ('2025502', $2::uuid, true, true)
      RETURNING serial_id, serial_number, is_used;
    `, [counters[0].counter_id, counters[1].counter_id]);
    const serials = serialResult.rows;
    console.log(`✓ Inserted ${serials.length} serial numbers\n`);

    // ============================================
    // 8. INSERT SAMPLE LABELS
    // ============================================
    console.log('🏷️ Inserting Sample Labels...');
    const labelResult = await client.query(`
      INSERT INTO Label (Product_id, Capacity_id, Model_id, Serial_id, Manufacturing_code, SSN, QR_data, format_id, Config_id)
      VALUES 
        ($1, $2, $3, $4, 'MFG001', 'SSN001', 'QR_DATA_001', $5, $6),
        ($1, $2, $3, $7, 'MFG002', 'SSN002', 'QR_DATA_002', $5, $6),
        ($8, $9, $10, $11, 'MFG003', 'SSN003', 'QR_DATA_003', $12, $13)
      RETURNING label_id, product_id, serial_id;
    `, [
      products[0].product_id,
      capacities[1].capacity_id,
      models[0].model_id,
      serials[0].serial_id,
      formats[0].format_id,
      configs[0].config_id,
      serials[1].serial_id,
      products[1].product_id,
      capacities[0].capacity_id,
      models[1].model_id,
      serials[2].serial_id,
      formats[1].format_id,
      configs[1].config_id
    ]);
    const labels = labelResult.rows;
    console.log(`✓ Inserted ${labels.length} labels\n`);

    // ============================================
    // 9. INSERT SAMPLE OVERALL EVENT REPORT
    // ============================================
    console.log('📊 Inserting Overall Event Reports...');
    const eventResult = await client.query(`
      INSERT INTO Overall_Event_Report (Event_number, Number_of_label_printed)
      VALUES 
        ('EVENT-001', 3),
        ('EVENT-002', 2)
      RETURNING overall_report_id, event_number, number_of_label_printed;
    `);
    const events = eventResult.rows;
    console.log(`✓ Inserted ${events.length} event reports\n`);

    // ============================================
    // 10. INSERT SAMPLE REPORTS
    // ============================================
    console.log('📝 Inserting Reports...');
    const reportResult = await client.query(`
      INSERT INTO Report (Overall_report_id, Product_name, Capacity_name, Model_name, Serial_number, Manufacturing_code, SSN, Qr_data, Is_reprinted)
      VALUES 
        ($1, 'Coconut Oil 500ml', '500ml', 'COCONUT-2024-A1', '2026001', 'MFG001', 'SSN001', 'QR_DATA_001', false),
        ($1, 'Coconut Oil 500ml', '500ml', 'COCONUT-2024-A1', '2026002', 'MFG002', 'SSN002', 'QR_DATA_002', false),
        ($2, 'Coconut Oil 1L', '250ml', 'ALMOND-2024-B2', '2026003', 'MFG003', 'SSN003', 'QR_DATA_003', false)
      RETURNING report_id, serial_number, product_name;
    `, [events[0].overall_report_id, events[1].overall_report_id]);
    const reports = reportResult.rows;
    console.log(`✓ Inserted ${reports.length} reports\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════\n');
    console.log('📊 Data Summary:');
    console.log(`   ✓ ${products.length} Products`);
    console.log(`   ✓ ${capacities.length} Capacities`);
    console.log(`   ✓ ${models.length} Models`);
    console.log(`   ✓ ${formats.length} Print Formats`);
    console.log(`   ✓ ${configs.length} Label Configs`);
    console.log(`   ✓ ${counters.length} Serial Counters`);
    console.log(`   ✓ ${serials.length} Serial Numbers`);
    console.log(`   ✓ ${labels.length} Labels`);
    console.log(`   ✓ ${events.length} Event Reports`);
    console.log(`   ✓ ${reports.length} Reports`);
    console.log('\n🎉 Ready for API testing!\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed function
seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
