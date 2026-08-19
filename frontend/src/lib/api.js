import { supabase } from "./supabase";

const rows = (data) =>
  Array.isArray(data) ? data : data ? [data] : [];

const call = async (functionName, args) => {
  const { data, error } = await supabase.rpc(functionName, args);
  return { data: rows(data), error };
};

const callSingle = async (functionName, args) => {
  const { data, error } = await supabase.rpc(functionName, args);
  return { data, error };
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
      p_name: payload.medicine_name,
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
      p_stock_quantity: payload.initial_stock_quantity,
    }),
  adjustStock: (payload) =>
    call("adjust_stock", {
      p_batch_id: payload.batch_id,
      p_quantity_change: payload.quantity_change,
      p_reason: payload.reason,
  }),

  getBills: ({
    search = "",
    status = null,
    paymentMode = null,
    fromDate = null,
    toDate = null,
    limit = 50,
    offset = 0,
  } = {}) =>
    call("get_bills", {
      p_search: search || null,
      p_status: status || null,
      p_payment_mode: paymentMode || null,
      p_from_date: fromDate || null,
      p_to_date: toDate || null,
      p_limit: limit,
      p_offset: offset,
    }),

  getBillDetails: (billId) =>
    callSingle("get_bill_details", {
      p_bill_id: billId,
    }),
  getPharmacyDetails: () =>
    callSingle("get_pharmacy_details"),
  
  voidBill: (billId) =>
    call("void_bill", {
      p_bill_id: billId,
    }),

  getBillReturns: (billId) =>
    callSingle("get_bill_returns", {
      p_bill_id: billId,
  }),
};