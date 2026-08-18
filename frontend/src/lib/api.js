import { supabase } from "./supabase";

const rows = (data) =>
  Array.isArray(data) ? data : data ? [data] : [];

const call = async (functionName, args) => {
  const { data, error } = await supabase.rpc(functionName, args);
  return { data: rows(data), error };
};

export const api = {
  getMedicines: (search = "") =>
    call("get_medicines", {
      p_search: search,
    }),

  getMedicineBatches: (medicineId) =>
    call("get_medicine_batches", {
      p_medicine_id: medicineId,
    }),

  createMedicine: (payload) =>
    call("create_medicine", {
      p_medicine_name: payload.medicine_name,
      p_pack_type: payload.pack_type,
      p_tablets_per_strip: payload.tablets_per_strip,
      p_gst_rate: payload.gst_rate,
      p_hsn_code: payload.hsn_code,
      p_schedule: payload.schedule,
    }),

  addBatch: (payload) =>
    call("add_batch", {
      p_medicine_id: payload.medicine_id,
      p_batch_number: payload.batch_number,
      p_expiry_date: payload.expiry_date,
      p_mrp: payload.mrp,
      p_initial_stock_quantity: payload.initial_stock_quantity,
    }),

  adjustStock: (batchId, adjustment, reason) =>
    call("adjust_stock", {
      p_batch_id: batchId,
      p_adjustment: adjustment,
      p_reason: reason,
    }),
};