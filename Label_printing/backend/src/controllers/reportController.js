// // import * as reportModel from '../models/reportModel.js';

// // export async function getEventReports(req, res) {
// //   try {
// //     const reports = await reportModel.getEventReports();
// //     res.json({ success: true, data: reports, message: 'Event reports retrieved successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event reports', details: error.message });
// //   }
// // }

// // export async function getEventReportById(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const report = await reportModel.getEventSummary(id);
// //     if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Event report not found' });
// //     res.json({ success: true, data: report, message: 'Event report retrieved successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event report', details: error.message });
// //   }
// // }

// // export async function createEventReport(req, res) {
// //   try {
// //     const { eventNumber, numberOfLabelsPrinted } = req.body;
// //     if (!eventNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event number is required' });
// //     const report = await reportModel.createEventReport(eventNumber, numberOfLabelsPrinted);
// //     res.status(201).json({ success: true, data: report, message: 'Event report created successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create event report', details: error.message });
// //   }
// // }

// // export async function getReports(req, res) {
// //   try {
// //     const reports = await reportModel.getReports();
// //     res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
// //   }
// // }

// // export async function getReportsByEvent(req, res) {
// //   try {
// //     const { eventId } = req.params;
// //     const reports = await reportModel.getReportsByEvent(eventId);
// //     res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
// //   }
// // }

// // export async function createReport(req, res) {
// //   try {
// //     const { eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData } = req.body;
// //     if (!eventId || !serialNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event ID and Serial Number required' });
// //     const report = await reportModel.createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData);
// //     res.status(201).json({ success: true, data: report, message: 'Report created successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create report', details: error.message });
// //   }
// // }

// // export async function markAsReprinted(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const report = await reportModel.markAsReprinted(id);
// //     if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Report not found' });
// //     res.json({ success: true, data: report, message: 'Report marked as reprinted' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to mark as reprinted', details: error.message });
// //   }
// // }

// // export async function getReportSummary(req, res) {
// //   try {
// //     const summary = await reportModel.getReportSummary();
// //     res.json({ success: true, data: summary, message: 'Report summary retrieved' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve summary', details: error.message });
// //   }
// // }

// // export async function getReportsByFilter(req, res) {
// //   try {
// //     const filters = req.query;
// //     const reports = await reportModel.getReportsByFilter(filters);
// //     res.json({ success: true, data: reports, message: 'Filtered reports retrieved' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve filtered reports', details: error.message });
// //   }
// // }

// import * as reportModel from '../models/reportModel.js';

// export async function getEventReports(req, res) {
//   try {
//     const reports = await reportModel.getEventReports();
//     res.json({ success: true, data: reports, message: 'Event reports retrieved successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event reports', details: error.message });
//   }
// }

// export async function getEventReportById(req, res) {
//   try {
//     const { id } = req.params;
//     const report = await reportModel.getEventSummary(id);
//     if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Event report not found' });
//     res.json({ success: true, data: report, message: 'Event report retrieved successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event report', details: error.message });
//   }
// }

// export async function createEventReport(req, res) {
//   try {
//     const { eventNumber, numberOfLabelsPrinted } = req.body;
//     if (!eventNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event number is required' });
//     const report = await reportModel.createEventReport(eventNumber, numberOfLabelsPrinted);
//     res.status(201).json({ success: true, data: report, message: 'Event report created successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create event report', details: error.message });
//   }
// }

// export async function getReports(req, res) {
//   try {
//     const reports = await reportModel.getReports();
//     res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
//   }
// }

// export async function getReportsByEvent(req, res) {
//   try {
//     const { eventId } = req.params;
//     const reports = await reportModel.getReportsByEvent(eventId);
//     res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
//   }
// }

// // ============================================
// // ✅ NEW: Get UNIQUE reports by event (deduplicates by serial number)
// // Returns unique serials with label_count for each
// // ============================================


// export async function getUniqueReportsByEvent(req, res) {
//   try {
//     const { eventId } = req.params;

//     console.log("Fetching unique reports for:", eventId);

//     const reports = await reportModel.getUniqueReportsByEvent(eventId);

//     res.json({
//       success: true,
//       data: reports || [],
//       message: 'Unique reports retrieved successfully'
//     });

//   } catch (error) {
//     console.error("CONTROLLER ERROR:", error);

//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to retrieve unique reports',
//       details: error.message
//     });
//   }
// }

// export async function createReport(req, res) {
//   try {
//     const { eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData } = req.body;
//     if (!eventId || !serialNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event ID and Serial Number required' });
//     const report = await reportModel.createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData);
//     res.status(201).json({ success: true, data: report, message: 'Report created successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create report', details: error.message });
//   }
// }

// export async function markAsReprinted(req, res) {
//   try {
//     const { id } = req.params;
//     const report = await reportModel.markAsReprinted(id);
//     if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Report not found' });
//     res.json({ success: true, data: report, message: 'Report marked as reprinted' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to mark as reprinted', details: error.message });
//   }
// }

// export async function getReportSummary(req, res) {
//   try {
//     const summary = await reportModel.getReportSummary();
//     res.json({ success: true, data: summary, message: 'Report summary retrieved' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve summary', details: error.message });
//   }
// }

// export async function getReportsByFilter(req, res) {
//   try {
//     const filters = req.query;
//     const reports = await reportModel.getReportsByFilter(filters);
//     res.json({ success: true, data: reports, message: 'Filtered reports retrieved' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve filtered reports', details: error.message });
//   }
// }


import * as reportModel from '../models/reportModel.js';

export async function getEventReports(req, res) {
  try {
    const reports = await reportModel.getEventReports();
    res.json({ success: true, data: reports, message: 'Event reports retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event reports', details: error.message });
  }
}

export async function getEventReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await reportModel.getEventSummary(id);
    if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Event report not found' });
    res.json({ success: true, data: report, message: 'Event report retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve event report', details: error.message });
  }
}

export async function createEventReport(req, res) {
  try {
    const { eventNumber, numberOfLabelsPrinted } = req.body;
    if (!eventNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event number is required' });
    const report = await reportModel.createEventReport(eventNumber, numberOfLabelsPrinted);
    res.status(201).json({ success: true, data: report, message: 'Event report created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create event report', details: error.message });
  }
}

export async function getReports(req, res) {
  try {
    const reports = await reportModel.getReports();
    res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
  }
}

export async function getReportsByEvent(req, res) {
  try {
    const { eventId } = req.params;
    const reports = await reportModel.getReportsByEvent(eventId);
    res.json({ success: true, data: reports, message: 'Reports retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve reports', details: error.message });
  }
}

// ============================================
// Get UNIQUE reports by event (deduplicates by serial number)
// ============================================

export async function getUniqueReportsByEvent(req, res) {
  try {
    const { eventId } = req.params;
    console.log("Fetching unique reports for:", eventId);
    const reports = await reportModel.getUniqueReportsByEvent(eventId);
    res.json({
      success: true,
      data: reports || [],
      message: 'Unique reports retrieved successfully'
    });
  } catch (error) {
    console.error("CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve unique reports',
      details: error.message
    });
  }
}

// ============================================
// ✅ NEW: Search events with labels
// Supports time filter and field-based search
// ============================================

export async function searchEventsWithLabels(req, res) {
  try {
    const { timeFilter, searchField, searchValue } = req.query;
    
    const filters = {
      timeFilter: timeFilter || 'all',
      searchField: searchField || null,
      searchValue: searchValue || null
    };
    
    console.log('Search filters:', filters);
    
    const events = await reportModel.searchEventsWithLabels(filters);
    
    res.json({
      success: true,
      data: events || [],
      message: 'Events searched successfully',
      filters: filters
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to search events',
      details: error.message
    });
  }
}

// ============================================
// ✅ NEW: Get filtered labels for an event
// ============================================

export async function getFilteredLabelsByEvent(req, res) {
  try {
    const { eventId } = req.params;
    const { searchField, searchValue } = req.query;
    
    const labels = await reportModel.getFilteredLabelsByEvent(eventId, searchField, searchValue);
    
    res.json({
      success: true,
      data: labels || [],
      message: 'Filtered labels retrieved successfully'
    });
  } catch (error) {
    console.error("CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve filtered labels',
      details: error.message
    });
  }
}

export async function createReport(req, res) {
  try {
    const { eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData } = req.body;
    if (!eventId || !serialNumber) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Event ID and Serial Number required' });
    const report = await reportModel.createReport(eventId, productName, capacityName, modelName, serialNumber, manufacturingCode, ssn, qrData);
    res.status(201).json({ success: true, data: report, message: 'Report created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to create report', details: error.message });
  }
}

export async function markAsReprinted(req, res) {
  try {
    const { id } = req.params;
    const report = await reportModel.markAsReprinted(id);
    if (!report) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Report not found' });
    res.json({ success: true, data: report, message: 'Report marked as reprinted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to mark as reprinted', details: error.message });
  }
}

export async function getReportSummary(req, res) {
  try {
    const summary = await reportModel.getReportSummary();
    res.json({ success: true, data: summary, message: 'Report summary retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve summary', details: error.message });
  }
}

export async function getReportsByFilter(req, res) {
  try {
    const filters = req.query;
    const reports = await reportModel.getReportsByFilter(filters);
    res.json({ success: true, data: reports, message: 'Filtered reports retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'DATABASE_ERROR', message: 'Failed to retrieve filtered reports', details: error.message });
  }
}