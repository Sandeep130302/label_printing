// import * as configModel from '../models/configModel.js';

// // ============================================
// // LABEL_CONFIG ENDPOINTS
// // ============================================

// export async function getConfigs(req, res) {
//   try {
//     const configs = await configModel.getConfigs();
//     res.json({
//       success: true,
//       data: configs,
//       message: 'Label configurations retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error fetching configs:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to retrieve label configurations',
//       details: error.message
//     });
//   }
// }

// export async function getConfigById(req, res) {
//   try {
//     const { id } = req.params;
//     const config = await configModel.getConfigById(id);

//     if (!config) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Label configuration not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: config,
//       message: 'Label configuration retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error fetching config:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to retrieve label configuration',
//       details: error.message
//     });
//   }
// }

// export async function createConfig(req, res) {
//   try {
//     const { companyName, logoUrl, madeInValue } = req.body;

//     if (!companyName || companyName.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Company name is required'
//       });
//     }

//     const config = await configModel.createConfig(companyName, logoUrl, madeInValue);

//     res.status(201).json({
//       success: true,
//       data: config,
//       message: 'Label configuration created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating config:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to create label configuration',
//       details: error.message
//     });
//   }
// }

// export async function updateConfig(req, res) {
//   try {
//     const { id } = req.params;
//     const { companyName, logoUrl, madeInValue, isActive } = req.body;

//     if (!companyName || companyName.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Company name is required'
//       });
//     }

//     const config = await configModel.updateConfig(id, companyName, logoUrl, madeInValue, isActive);

//     if (!config) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Label configuration not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: config,
//       message: 'Label configuration updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating config:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to update label configuration',
//       details: error.message
//     });
//   }
// }

// export async function deleteConfig(req, res) {
//   try {
//     const { id } = req.params;
//     const config = await configModel.deleteConfig(id);

//     if (!config) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Label configuration not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: config,
//       message: 'Label configuration deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting config:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to delete label configuration',
//       details: error.message
//     });
//   }
// }

// // ============================================
// // PRINT_FORMAT ENDPOINTS
// // ============================================

// export async function getFormats(req, res) {
//   try {
//     const formats = await configModel.getFormats();
//     res.json({
//       success: true,
//       data: formats,
//       message: 'Print formats retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error fetching formats:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to retrieve print formats',
//       details: error.message
//     });
//   }
// }

// export async function getFormatById(req, res) {
//   try {
//     const { id } = req.params;
//     const format = await configModel.getFormatById(id);

//     if (!format) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Print format not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: format,
//       message: 'Print format retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Error fetching format:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to retrieve print format',
//       details: error.message
//     });
//   }
// }

// export async function createFormat(req, res) {
//   try {
//     const { formatName, dimension, labelPerPage } = req.body;

//     if (!formatName || formatName.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Format name is required'
//       });
//     }

//     if (!labelPerPage || labelPerPage <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Labels per page must be greater than 0'
//       });
//     }

//     const format = await configModel.createFormat(formatName, dimension, labelPerPage);

//     res.status(201).json({
//       success: true,
//       data: format,
//       message: 'Print format created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating format:', error);

//     if (error.code === '23505') {
//       return res.status(409).json({
//         success: false,
//         error: 'DUPLICATE_ENTRY',
//         message: 'Format name already exists'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to create print format',
//       details: error.message
//     });
//   }
// }

// export async function updateFormat(req, res) {
//   try {
//     const { id } = req.params;
//     const { formatName, dimension, labelPerPage } = req.body;

//     if (!formatName || formatName.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Format name is required'
//       });
//     }

//     if (!labelPerPage || labelPerPage <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Labels per page must be greater than 0'
//       });
//     }

//     const format = await configModel.updateFormat(id, formatName, dimension, labelPerPage);

//     if (!format) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Print format not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: format,
//       message: 'Print format updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating format:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to update print format',
//       details: error.message
//     });
//   }
// }

// export async function deleteFormat(req, res) {
//   try {
//     const { id } = req.params;
//     const format = await configModel.deleteFormat(id);

//     if (!format) {
//       return res.status(404).json({
//         success: false,
//         error: 'NOT_FOUND',
//         message: 'Print format not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: format,
//       message: 'Print format deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting format:', error);
//     res.status(500).json({
//       success: false,
//       error: 'DATABASE_ERROR',
//       message: 'Failed to delete print format',
//       details: error.message
//     });
//   }
// }



import * as configModel from '../models/configModel.js';

// ============================================
// LABEL_CONFIG ENDPOINTS
// ============================================

export async function getConfigs(req, res) {
  try {
    const configs = await configModel.getConfigs();
    res.json({
      success: true,
      data: configs,
      message: 'Label configurations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching configs:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve label configurations',
      details: error.message
    });
  }
}

// ✅ NEW: Get active config for label printing
export async function getActiveConfig(req, res) {
  try {
    const config = await configModel.getActiveConfig();
    res.json({
      success: true,
      data: config,
      message: config ? 'Active configuration retrieved' : 'No active configuration found'
    });
  } catch (error) {
    console.error('Error fetching active config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve active configuration',
      details: error.message
    });
  }
}

export async function getConfigById(req, res) {
  try {
    const { id } = req.params;
    const config = await configModel.getConfigById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Label configuration not found'
      });
    }

    res.json({
      success: true,
      data: config,
      message: 'Label configuration retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve label configuration',
      details: error.message
    });
  }
}

// ✅ UPDATED: Create config with new fields
export async function createConfig(req, res) {
  try {
    const { companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo } = req.body;

    if (!companyName || companyName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Company name is required'
      });
    }

    const config = await configModel.createConfig(
      companyName,
      companySubtitle || '',
      callAssistantNo || '',
      madeInValue || 'MADE IN INDIA',
      companyLogo || null
    );

    res.status(201).json({
      success: true,
      data: config,
      message: 'Label configuration created successfully'
    });
  } catch (error) {
    console.error('Error creating config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create label configuration',
      details: error.message
    });
  }
}

// ✅ UPDATED: Update config with new fields
export async function updateConfig(req, res) {
  try {
    const { id } = req.params;
    const { companyName, companySubtitle, callAssistantNo, madeInValue, companyLogo, isActive } = req.body;

    if (!companyName || companyName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Company name is required'
      });
    }

    const config = await configModel.updateConfig(
      id,
      companyName,
      companySubtitle || '',
      callAssistantNo || '',
      madeInValue || 'MADE IN INDIA',
      companyLogo || null,
      isActive !== false
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Label configuration not found'
      });
    }

    res.json({
      success: true,
      data: config,
      message: 'Label configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to update label configuration',
      details: error.message
    });
  }
}

// ✅ NEW: Save config (create or update) - for Settings page
export async function saveConfig(req, res) {
  try {
    const data = req.body;

    if (!data.company_name || data.company_name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Company name is required'
      });
    }

    const config = await configModel.saveConfig(data);

    res.json({
      success: true,
      data: config,
      message: 'Label configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to save label configuration',
      details: error.message
    });
  }
}

export async function deleteConfig(req, res) {
  try {
    const { id } = req.params;
    const config = await configModel.deleteConfig(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Label configuration not found'
      });
    }

    res.json({
      success: true,
      data: config,
      message: 'Label configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to delete label configuration',
      details: error.message
    });
  }
}

// ============================================
// PRINT_FORMAT ENDPOINTS
// ============================================

export async function getFormats(req, res) {
  try {
    const formats = await configModel.getFormats();
    res.json({
      success: true,
      data: formats,
      message: 'Print formats retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching formats:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve print formats',
      details: error.message
    });
  }
}

export async function getFormatById(req, res) {
  try {
    const { id } = req.params;
    const format = await configModel.getFormatById(id);

    if (!format) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Print format not found'
      });
    }

    res.json({
      success: true,
      data: format,
      message: 'Print format retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching format:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to retrieve print format',
      details: error.message
    });
  }
}

export async function createFormat(req, res) {
  try {
    const { formatName, dimension, labelPerPage } = req.body;

    if (!formatName || formatName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Format name is required'
      });
    }

    if (!labelPerPage || labelPerPage <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Labels per page must be greater than 0'
      });
    }

    const format = await configModel.createFormat(formatName, dimension, labelPerPage);

    res.status(201).json({
      success: true,
      data: format,
      message: 'Print format created successfully'
    });
  } catch (error) {
    console.error('Error creating format:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Format name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to create print format',
      details: error.message
    });
  }
}

export async function updateFormat(req, res) {
  try {
    const { id } = req.params;
    const { formatName, dimension, labelPerPage } = req.body;

    if (!formatName || formatName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Format name is required'
      });
    }

    if (!labelPerPage || labelPerPage <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Labels per page must be greater than 0'
      });
    }

    const format = await configModel.updateFormat(id, formatName, dimension, labelPerPage);

    if (!format) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Print format not found'
      });
    }

    res.json({
      success: true,
      data: format,
      message: 'Print format updated successfully'
    });
  } catch (error) {
    console.error('Error updating format:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to update print format',
      details: error.message
    });
  }
}

export async function deleteFormat(req, res) {
  try {
    const { id } = req.params;
    const format = await configModel.deleteFormat(id);

    if (!format) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Print format not found'
      });
    }

    res.json({
      success: true,
      data: format,
      message: 'Print format deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting format:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to delete print format',
      details: error.message
    });
  }
}
