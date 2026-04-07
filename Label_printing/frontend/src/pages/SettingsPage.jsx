import { useState, useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as api from "@/services/api";

function SettingsPage() {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Original config from database (for cancel/reset)
  const [originalConfig, setOriginalConfig] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    companySubtitle: "",
    callAssistantNo: "",
    madeInValue: "",
    companyLogo: null
  });

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const result = await api.getActiveConfig();
      if (result.success && result.data) {
        const config = result.data;
        setOriginalConfig(config);
        setFormData({
          companyName: config.company_name || "",
          companySubtitle: config.company_subtitle || "",
          callAssistantNo: config.call_assistant_no || "",
          madeInValue: config.made_in_value || "",
          companyLogo: config.company_logo || null
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          companyLogo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle browse click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      companyLogo: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    // Reset to original config
    if (originalConfig) {
      setFormData({
        companyName: originalConfig.company_name || "",
        companySubtitle: originalConfig.company_subtitle || "",
        callAssistantNo: originalConfig.call_assistant_no || "",
        madeInValue: originalConfig.made_in_value || "",
        companyLogo: originalConfig.company_logo || null
      });
    } else {
      setFormData({
        companyName: "",
        companySubtitle: "",
        callAssistantNo: "",
        madeInValue: "",
        companyLogo: null
      });
    }
    toast.info("Changes cancelled");
  };

  // Handle Save
  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        company_name: formData.companyName,
        company_subtitle: formData.companySubtitle,
        call_assistant_no: formData.callAssistantNo,
        made_in_value: formData.madeInValue,
        company_logo: formData.companyLogo
      };

      const result = await api.saveConfig(dataToSave);
      
      if (result.success) {
        // Update original config with new saved data
        if (result.data) {
          setOriginalConfig(result.data);
        }
        toast.success("Settings saved successfully");
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="erp-section-label">ADMINISTRATION</p>
        <h2 className="erp-page-title">LABEL CONFIGURATION</h2>
      </div>

      {/* Form Card */}
      <div className="erp-card p-8">
        <div className="max-w-2xl space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              COMPANY NAME
            </label>
            <Input
              className="h-12 bg-white border-border rounded-full px-5 text-sm"
              placeholder="ENTER YOUR COMPANY NAME ....."
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />
          </div>

          {/* Company Subtitle */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              COMPANY SUBTITLE
            </label>
            <Input
              className="h-12 bg-white border-border rounded-full px-5 text-sm"
              placeholder="ENTER YOUR COMPANY  SUBTITLE ....."
              value={formData.companySubtitle}
              onChange={(e) => handleInputChange('companySubtitle', e.target.value)}
            />
          </div>

          {/* Call Assistant No */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              CALL ASSISTANT NO
            </label>
            <Input
              className="h-12 bg-white border-border rounded-full px-5 text-sm"
              placeholder="ENTER YOUR COMPANY PH NO ....."
              value={formData.callAssistantNo}
              onChange={(e) => handleInputChange('callAssistantNo', e.target.value)}
            />
          </div>

          {/* Made In Value */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              MADE IN VALUE
            </label>
            <Input
              className="h-12 bg-white border-border rounded-full px-5 text-sm"
              placeholder="EX . MADE IN INDIA ..."
              value={formData.madeInValue}
              onChange={(e) => handleInputChange('madeInValue', e.target.value)}
            />
          </div>

          {/* Company Logo Photo */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              COMPANY LOGO PHOTO
            </label>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Upload Zone */}
            {!formData.companyLogo ? (
              <div
                className={`
                  w-72 h-32 border-2 border-dashed rounded-lg
                  flex flex-col items-center justify-center gap-2
                  cursor-pointer transition-colors
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-xs text-gray-500 text-center px-4">
                  Browse and chose the files you want to<br />
                  upload from your computer
                </p>
              </div>
            ) : (
              <div className="relative w-72 h-32 border border-gray-200 rounded-lg overflow-hidden bg-white">
                <img
                  src={formData.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="px-8 h-10 rounded-md"
            onClick={handleCancel}
            disabled={saving}
          >
            CANCEL
          </Button>
          <Button
            className="px-8 h-10 rounded-md bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "SAVING..." : "SAVE"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;