// const STORE_KEYS = {
//   products: "lps_products",
//   capacities: "lps_capacities",
//   models: "lps_models",
//   events: "lps_events",
//   config: "lps_config",
//   serialCounter: "lps_serial_counter",
//   serialResetDate: "lps_serial_reset",
//   eventCounter: "lps_event_counter"
// };
// function read(key) {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }
// function write(key, data) {
//   localStorage.setItem(key, JSON.stringify(data));
// }
// function getMasterItems(category) {
//   return read(STORE_KEYS[category]) || [];
// }
// function getActiveMasterItems(category) {
//   return getMasterItems(category).filter((i) => i.status === "active");
// }
// function addMasterItem(category, item) {
//   const items = getMasterItems(category);
//   items.push(item);
//   write(STORE_KEYS[category], items);
// }
// function updateMasterItem(category, id, updates) {
//   const items = getMasterItems(category).map(
//     (i) => i.id === id ? { ...i, ...updates } : i
//   );
//   write(STORE_KEYS[category], items);
// }
// function deleteMasterItem(category, id) {
//   updateMasterItem(category, id, { status: "inactive" });
// }
// function shouldResetSerial() {
//   const lastReset = read(STORE_KEYS.serialResetDate);
//   const now = /* @__PURE__ */ new Date();
//   const currentFY = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
//   const resetDate = `${currentFY}-04-01`;
//   if (!lastReset || lastReset < resetDate) {
//     write(STORE_KEYS.serialResetDate, resetDate);
//     write(STORE_KEYS.serialCounter, 0);
//     return true;
//   }
//   return false;
// }
// function generateSerial() {
//   shouldResetSerial();
//   let counter = read(STORE_KEYS.serialCounter) || 0;
//   counter += 1;
//   write(STORE_KEYS.serialCounter, counter);
//   const now = /* @__PURE__ */ new Date();
//   const yy = String(now.getFullYear()).slice(-2);
//   const mm = String(now.getMonth() + 1).padStart(2, "0");
//   const xxxx = String(counter).padStart(4, "0");
//   return `${xxxx}${yy}${mm}`;
// }
// function generateEventNo() {
//   let counter = read(STORE_KEYS.eventCounter) || 0;
//   counter += 1;
//   write(STORE_KEYS.eventCounter, counter);
//   return `EVT-${String(counter).padStart(5, "0")}`;
// }
// function getEvents() {
//   return read(STORE_KEYS.events) || [];
// }
// function addEvent(event) {
//   const events = getEvents();
//   events.unshift(event);
//   write(STORE_KEYS.events, events);
// }
// const defaultConfig = {
//   companyName: "JR TECHLABS",
//   companySubtitle: "Smart Label Solutions",
//   callAssistanceNumber: "1800-XXX-XXXX",
//   footerText: "Made in India"
// };
// function getConfig() {
//   return read(STORE_KEYS.config) || { ...defaultConfig };
// }
// function saveConfig(config) {
//   write(STORE_KEYS.config, config);
// }
// function seedDemoData() {
//   if (getMasterItems("products").length > 0) return;
//   const products = [
//     { id: crypto.randomUUID(), name: "Water Purifier", status: "active" },
//     { id: crypto.randomUUID(), name: "Air Cooler", status: "active" },
//     { id: crypto.randomUUID(), name: "Stabilizer", status: "active" }
//   ];
//   const capacities = [
//     { id: crypto.randomUUID(), name: "7L", status: "active" },
//     { id: crypto.randomUUID(), name: "10L", status: "active" },
//     { id: crypto.randomUUID(), name: "15L", status: "active" },
//     { id: crypto.randomUUID(), name: "25L", status: "active" }
//   ];
//   const models = [
//     { id: crypto.randomUUID(), name: "AquaPure-100", status: "active" },
//     { id: crypto.randomUUID(), name: "CoolBreeze-X", status: "active" },
//     { id: crypto.randomUUID(), name: "VoltGuard-Pro", status: "active" }
//   ];
//   write(STORE_KEYS.products, products);
//   write(STORE_KEYS.capacities, capacities);
//   write(STORE_KEYS.models, models);
// }
// export {
//   STORE_KEYS,
//   addEvent,
//   addMasterItem,
//   deleteMasterItem,
//   generateEventNo,
//   generateSerial,
//   getActiveMasterItems,
//   getConfig,
//   getEvents,
//   getMasterItems,
//   saveConfig,
//   seedDemoData,
//   updateMasterItem
// };
