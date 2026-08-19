import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import {
  Activity,
  ArrowRight,
  Boxes,
  ChevronLeft,
  CirclePlus,
  FileText,
  LogOut,
  Menu,
  PackageSearch,
  Pill,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import "@/App.css";

const navItems = [
  { id: "billing", label: "Billing", icon: FileText },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "tracker", label: "Tracker", icon: Activity },
  { id: "pharmacy", label: "Pharmacy", icon: Store },
];

const getValue = (item, keys, fallback = "—") => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return fallback;
};

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
    } else {
      onLogin(data.session);
    }

    setBusy(false);
  };

  return (
    <main className="login-page">
      <section className="login-panel" data-testid="login-panel">
        <div className="brand-lockup">
          <span className="brand-mark">
            <Pill size={21} />
          </span>
          <span>
            pharm<span className="brand-accent">desk</span>
          </span>
        </div>

        <div className="login-copy">
          <p className="eyebrow">PHARMACY OPERATIONS</p>
          <h1>Good morning.</h1>
          <p>
            Sign in to manage your counter, inventory, and daily records.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="login-form"
          data-testid="login-form"
        >
          <label>
            Email address
            <input
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pharmacy.com"
              required
            />
          </label>

          <label>
            Password
            <input
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && (
            <p className="form-error" data-testid="login-error">
              {error}
            </p>
          )}

          <button
            className="primary-button wide"
            data-testid="login-submit-button"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="login-foot">
          <ShieldCheck size={14} /> Secured by Supabase Auth
        </p>
      </section>

      <aside className="login-aside">
        <div className="aside-grid" />

        <div className="aside-content">
          <p className="eyebrow">YOUR DAILY COUNTER</p>
          <h2>
            Keep every sale
            <br />
            moving clearly.
          </h2>
          <p>
            One calm workspace for fast billing and confident stock
            decisions.
          </p>
        </div>

        <div className="aside-meta">
          <span>01</span>
          <span>AUTHENTICATED WORKSPACE</span>
        </div>
      </aside>
    </main>
  );
}

function Shell({
  session,
  onLogout,
  active,
  setActive,
  children,
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Pill size={18} />
          </span>
          <span>
            pharm<span className="brand-accent">desk</span>
          </span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${
                active === id ? "active" : ""
              }`}
              data-testid={`nav-${id}-button`}
              onClick={() => setActive(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip" data-testid="current-user">
            <span className="avatar">
              <UserRound size={15} />
            </span>

            <span className="user-email">
              {session?.user?.email || "Staff account"}
            </span>
          </div>

          <button
            className="logout-button"
            data-testid="logout-button"
            onClick={onLogout}
          >
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="mobile-header">
          <div className="sidebar-brand">
            <span className="brand-mark">
              <Pill size={17} />
            </span>
            <span>
              pharm<span className="brand-accent">desk</span>
            </span>
          </div>

          <button
            className="icon-button"
            data-testid="mobile-menu-button"
          >
            <Menu size={19} />
          </button>
        </header>

        {children}
      </main>

      <nav className="mobile-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={active === id ? "active" : ""}
            data-testid={`mobile-nav-${id}-button`}
            onClick={() => setActive(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 data-testid="page-title">{title}</h1>
        {description && (
          <p className="page-description">{description}</p>
        )}
      </div>

      {action}
    </header>
  );
}

function Billing() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);

  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [overallDiscount, setOverallDiscount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [creatingBill, setCreatingBill] = useState(false);

  const search = async (value) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setMedicines([]);
      return;
    }

    setLoading(true);

    const { data, error } = await api.getMedicines(value);

    if (error) {
      toast.error("Unable to search medicines");
      setMedicines([]);
    } else {
      setMedicines(data || []);
    }

    setLoading(false);
  };

  const chooseMedicine = async (medicine) => {
    setSelected(medicine);
    setMedicines([]);
    setQuery("");
    setBatchLoading(true);

    const { data, error } = await api.getMedicineBatches(medicine.id);

    if (error) {
      toast.error("Unable to load batches");
      setBatches([]);
    } else {
      setBatches(data || []);
    }

    setBatchLoading(false);
  };

  const addLine = (batch) => {
    const stock = Number(
      getValue(
        batch,
        ["stock_quantity", "available_stock", "stock"],
        0
      )
    );

    if (!stock) {
      toast.error("This batch has no available stock");
      return;
    }

    const alreadyAdded = items.some(
      (item) => item.batch?.id === batch.id
    );

    if (alreadyAdded) {
      toast.error("This batch is already in the bill");
      return;
    }

    setItems([
      ...items,
      {
        medicine: selected,
        batch,
        quantity: 1,
        discount: 0,
      },
    ]);

    setSelected(null);
    setBatches([]);
  };

  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, i) => {
        if (i !== index) return item;

        const numeric = Number(value);

        const max =
          field === "discount"
            ? 100
            : Number(
                getValue(
                  item.batch,
                  [
                    "stock_quantity",
                    "available_stock",
                    "stock",
                  ],
                  0
                )
              );

        const minimum = field === "quantity" ? 1 : 0;

        return {
          ...item,
          [field]: Math.max(
            minimum,
            Math.min(
              Number.isFinite(numeric)
                ? numeric
                : minimum,
              max
            )
          ),
        };
      })
    );
  };

  /*
   * BILLING CALCULATION RULES
   *
   * 1. Gross amount = MRP × quantity
   * 2. GST is calculated on the TRUE MRP amount
   * 3. Item discount is calculated separately on MRP
   * 4. Net item amount = gross + GST - item discount
   * 5. Overall bill discount is applied LAST
   */

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const mrp = Number(
        getValue(
          item.batch,
          ["mrp", "selling_price"],
          0
        )
      );

      const quantity = Number(item.quantity) || 0;

      const gstRate = Number(
        getValue(
          item.medicine,
          ["gst_rate", "gst"],
          0
        )
      );

      const itemDiscountPercent =
        Number(item.discount) || 0;

      // Full MRP value.
      const grossAmount = Number(
        (mrp * quantity).toFixed(2)
      );

      // GST is ALWAYS calculated from the true MRP.
      const gstAmount = Number(
        (
          grossAmount *
          gstRate /
          100
        ).toFixed(2)
      );

      // Item discount is also calculated from MRP.
      const itemDiscountAmount = Number(
        (
          grossAmount *
          itemDiscountPercent /
          100
        ).toFixed(2)
      );

      // Final amount for this item before overall discount.
      const lineTotal = Number(
        (
          grossAmount +
          gstAmount -
          itemDiscountAmount
        ).toFixed(2)
      );

      return {
        ...item,
        mrp,
        quantity,
        gstRate,
        itemDiscountPercent,
        grossAmount,
        gstAmount,
        itemDiscountAmount,
        lineTotal,
      };
    });
  }, [items]);

  // True MRP subtotal before item discounts and GST.
  const subtotal = Number(
    calculatedItems
      .reduce(
        (sum, item) => sum + item.grossAmount,
        0
      )
      .toFixed(2)
  );

  // GST calculated independently from MRP.
  const gstTotal = Number(
    calculatedItems
      .reduce(
        (sum, item) => sum + item.gstAmount,
        0
      )
      .toFixed(2)
  );

  // Total of individual item discounts.
  const itemDiscountTotal = Number(
    calculatedItems
      .reduce(
        (sum, item) =>
          sum + item.itemDiscountAmount,
        0
      )
      .toFixed(2)
  );

  // Amount after individual item discounts
  // and GST, before overall discount.
  const beforeOverallDiscount = Number(
    calculatedItems
      .reduce(
        (sum, item) => sum + item.lineTotal,
        0
      )
      .toFixed(2)
  );

  const overallDiscountPercent = Math.max(
    0,
    Math.min(
      100,
      Number(overallDiscount) || 0
    )
  );

  // Overall discount is applied LAST.
  const overallDiscountAmount = Number(
    (
      beforeOverallDiscount *
      overallDiscountPercent /
      100
    ).toFixed(2)
  );

  const total = Number(
    (
      beforeOverallDiscount -
      overallDiscountAmount
    ).toFixed(2)
  );

  const canGenerateBill =
    patientName.trim().length > 0 &&
    items.length > 0 &&
    !creatingBill;

  const generateBill = async () => {
    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }

    if (!items.length) {
      toast.error("Add at least one medicine");
      return;
    }

    if (
      paymentMode !== "Cash" &&
      paymentMode !== "UPI"
    ) {
      toast.error("Payment mode must be Cash or UPI");
      return;
    }

    setCreatingBill(true);

    const billItems = calculatedItems.map(
      (item) => ({
        medicine_id: item.medicine.id,
        batch_id: item.batch.id,
        quantity: item.quantity,
        item_discount_percent:
          item.itemDiscountPercent,
      })
    );

    const { data, error } =
      await supabase.rpc("create_bill", {
        p_patient_name: patientName.trim(),
        p_doctor_name:
          doctorName.trim() || null,
        p_payment_mode: paymentMode,
        p_overall_discount_percent:
          overallDiscountPercent,
        p_items: billItems,
      });

    if (error) {
      console.error(
        "create_bill error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to create bill"
      );

      setCreatingBill(false);
      return;
    }

    const result = data || {};

    toast.success(
      result.bill_number
        ? `Bill ${result.bill_number} created successfully`
        : "Bill created successfully"
    );

    setPatientName("");
    setDoctorName("");
    setPaymentMode("Cash");
    setOverallDiscount(0);
    setItems([]);
    setSelected(null);
    setBatches([]);
    setQuery("");
    setMedicines([]);

    setCreatingBill(false);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="COUNTER / BILLING"
        title="New bill"
        description="Create a bill with explicit batch and quantity control."
        action={
          <span className="status-pill">
            <span /> Backend connected
          </span>
        }
      />

      <section
        className="billing-meta"
        data-testid="billing-meta-section"
      >
        <label>
          Patient name

          <input
            data-testid="patient-name-input"
            value={patientName}
            onChange={(e) =>
              setPatientName(e.target.value)
            }
            placeholder="Patient name"
            required
          />
        </label>

        <label>
          Doctor name

          <input
            data-testid="doctor-name-input"
            value={doctorName}
            onChange={(e) =>
              setDoctorName(e.target.value)
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Payment mode

          <select
            data-testid="payment-mode-select"
            value={paymentMode}
            onChange={(e) =>
              setPaymentMode(e.target.value)
            }
          >
            <option>Cash</option>
            <option>UPI</option>
          </select>
        </label>
      </section>

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              ADD MEDICINE
            </p>

            <h2>Find a medicine</h2>
          </div>

          <span className="unit-note">
            Quantities are entered in smallest
            sellable units
          </span>
        </div>

        <div className="search-wrap">
          <Search size={18} />

          <input
            data-testid="medicine-search-input"
            value={query}
            onChange={(e) =>
              search(e.target.value)
            }
            placeholder="Search by medicine name…"
          />

          {query && (
            <button
              className="clear-button"
              data-testid="clear-medicine-search-button"
              onClick={() => {
                setQuery("");
                setMedicines([]);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {query.length > 1 && (
          <div
            className="search-results"
            data-testid="medicine-search-results"
          >
            {loading ? (
              <div className="inline-state">
                Searching medicines…
              </div>
            ) : medicines.length ? (
              medicines.map((medicine) => (
                <button
                  className="search-result"
                  data-testid={`medicine-result-${medicine.id}`}
                  key={medicine.id}
                  onClick={() =>
                    chooseMedicine(medicine)
                  }
                >
                  <span className="result-icon">
                    <Pill size={16} />
                  </span>

                  <span>
                    <strong>
                      {getValue(
                        medicine,
                        [
                          "medicine_name",
                          "name",
                        ]
                      )}
                    </strong>

                    <small>
                      {getValue(
                        medicine,
                        [
                          "pack_type",
                          "packType",
                        ],
                        "Pack"
                      )}
                    </small>
                  </span>

                  <ArrowRight size={15} />
                </button>
              ))
            ) : (
              <div className="inline-state">
                No medicines found.
              </div>
            )}
          </div>
        )}

        {selected && (
          <div
            className="batch-picker"
            data-testid="batch-picker"
          >
            <div className="batch-picker-head">
              <div>
                <p className="eyebrow">
                  SELECT BATCH
                </p>

                <h3>
                  {getValue(
                    selected,
                    [
                      "medicine_name",
                      "name",
                    ]
                  )}
                </h3>
              </div>

              <button
                className="icon-button"
                data-testid="close-batch-picker-button"
                onClick={() => {
                  setSelected(null);
                  setBatches([]);
                }}
              >
                <X size={17} />
              </button>
            </div>

            {batchLoading ? (
              <div className="inline-state">
                Loading batches…
              </div>
            ) : batches.length ? (
              <div className="batch-list">
                {batches.map((batch, i) => (
                  <button
                    className="batch-row"
                    key={batch.id || i}
                    data-testid={`batch-option-${batch.id || i}`}
                    onClick={() =>
                      addLine(batch)
                    }
                  >
                    <span>
                      <strong>
                        {getValue(
                          batch,
                          [
                            "batch_number",
                            "batch_no",
                          ]
                        )}
                      </strong>

                      <small>
                        Expires{" "}
                        {getValue(
                          batch,
                          [
                            "expiry_date",
                            "expiry",
                          ]
                        )}
                      </small>
                    </span>

                    <span>
                      <strong>
                        {getValue(
                          batch,
                          [
                            "stock_quantity",
                            "available_stock",
                            "stock",
                          ],
                          0
                        )}{" "}
                        units
                      </strong>

                      <small>
                        MRP ₹
                        {getValue(
                          batch,
                          [
                            "mrp",
                            "selling_price",
                          ],
                          "—"
                        )}
                      </small>
                    </span>

                    <Plus size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <PackageSearch size={19} />

                <span>
                  No batches available for
                  this medicine.
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              BILL ITEMS
            </p>

            <h2>
              {items.length
                ? `${items.length} item${
                    items.length > 1
                      ? "s"
                      : ""
                  }`
                : "Your bill is empty"}
            </h2>
          </div>

          <span className="unit-note">
            Item discounts default to 0%
          </span>
        </div>

        <div className="table-frame">
          <table className="data-table billing-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch / expiry</th>
                <th>Available</th>
                <th>Quantity</th>
                <th>MRP</th>
                <th>GST</th>
                <th>Discount</th>
                <th>Net amount</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                calculatedItems.map(
                  (item, index) => (
                    <tr
                      key={`${item.batch.id || index}`}
                      data-testid={`bill-item-row-${index}`}
                    >
                      <td>
                        <strong>
                          {getValue(
                            item.medicine,
                            [
                              "medicine_name",
                              "name",
                            ]
                          )}
                        </strong>

                        <small>
                          {getValue(
                            item.medicine,
                            [
                              "pack_type",
                              "packType",
                            ],
                            "Unit"
                          )}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {getValue(
                            item.batch,
                            [
                              "batch_number",
                              "batch_no",
                            ]
                          )}
                        </strong>

                        <small>
                          {getValue(
                            item.batch,
                            [
                              "expiry_date",
                              "expiry",
                            ]
                          )}
                        </small>
                      </td>

                      <td>
                        {getValue(
                          item.batch,
                          [
                            "stock_quantity",
                            "available_stock",
                            "stock",
                          ],
                          0
                        )}{" "}
                        units
                      </td>

                      <td>
                        <input
                          className="table-input"
                          data-testid={`bill-quantity-input-${index}`}
                          type="number"
                          min="1"
                          max={getValue(
                            item.batch,
                            [
                              "stock_quantity",
                              "available_stock",
                              "stock",
                            ],
                            0
                          )}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        ₹
                        {item.mrp.toFixed(
                          2
                        )}
                      </td>

                      <td>
                        <strong>
                          {item.gstRate.toFixed(
                            2
                          )}
                          %
                        </strong>

                        <small>
                          ₹
                          {item.gstAmount.toFixed(
                            2
                          )}
                        </small>
                      </td>

                      <td>
                        <div className="percent-input">
                          <input
                            className="table-input"
                            data-testid={`bill-discount-input-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "discount",
                                e.target.value
                              )
                            }
                          />

                          <span>%</span>
                        </div>

                        <small>
                          -₹
                          {item.itemDiscountAmount.toFixed(
                            2
                          )}
                        </small>
                      </td>

                      <td>
                        <strong>
                          ₹
                          {item.lineTotal.toFixed(
                            2
                          )}
                        </strong>
                      </td>

                      <td>
                        <button
                          className="icon-button danger"
                          data-testid={`remove-bill-item-${index}`}
                          onClick={() =>
                            setItems(
                              items.filter(
                                (_, i) =>
                                  i !== index
                              )
                            )
                          }
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <FileText size={20} />

                      <strong>
                        No items added yet
                      </strong>

                      <span>
                        Search above and choose
                        a batch to begin.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bill-footer">
          <label className="overall-discount">
            Overall discount

            <div className="percent-input">
              <input
                className="table-input"
                data-testid="overall-discount-input"
                type="number"
                min="0"
                max="100"
                value={overallDiscount}
                onChange={(e) =>
                  setOverallDiscount(
                    e.target.value
                  )
                }
              />

              <span>%</span>
            </div>
          </label>

          <div className="totals">
            <div>
              <span>Subtotal</span>

              <strong data-testid="bill-subtotal">
                ₹{subtotal.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>GST</span>

              <strong data-testid="bill-gst">
                ₹{gstTotal.toFixed(2)}
              </strong>
            </div>

            {itemDiscountTotal > 0 && (
              <div>
                <span>
                  Item discounts
                </span>

                <strong>
                  -₹
                  {itemDiscountTotal.toFixed(
                    2
                  )}
                </strong>
              </div>
            )}

            {overallDiscountAmount > 0 && (
              <div>
                <span>
                  Overall discount
                </span>

                <strong>
                  -₹
                  {overallDiscountAmount.toFixed(
                    2
                  )}
                </strong>
              </div>
            )}

            <div className="total-line">
              <span>Total</span>

              <strong data-testid="bill-total">
                ₹{total.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="billing-actions">
          <span
            className="pending-note"
            data-testid="create-bill-pending-note"
          >
            {creatingBill
              ? "Creating bill and updating stock…"
              : items.length
                ? "Ready to create this bill."
                : "Add medicines to begin."}
          </span>

          <button
            className="primary-button"
            data-testid="generate-bill-button"
            disabled={!canGenerateBill}
            onClick={generateBill}
          >
            <FileText size={17} />

            {creatingBill
              ? "Creating bill…"
              : "Generate bill"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [batches, setBatches] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    medicine_name: "",
    pack_type: "Strip",
    tablets_per_strip: "",
    gst_rate: "",
    hsn_code: "",
    schedule: "Schedule C",
  });

  const load = async (value = "") => {
    setLoading(true);

    const { data, error } =
      await api.getMedicines(value);

    if (error) {
      toast.error("Unable to load inventory");
    }

    setMedicines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openMedicine = async (medicine) => {
    setSelected(medicine);

    const { data, error } =
      await api.getMedicineBatches(medicine.id);

    if (error) {
      toast.error("Unable to load batches");
    }

    setBatches(data || []);
  };

  const createMedicine = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      tablets_per_strip:
        form.pack_type === "Strip"
          ? Number(form.tablets_per_strip)
          : null,
      gst_rate: Number(form.gst_rate),
    };

    const { error } =
      await api.createMedicine(payload);

    if (error) {
      toast.error("Unable to add medicine");
    } else {
      toast.success("Medicine added");
      setShowAdd(false);
      load(query);
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="STOCK / INVENTORY"
        title="Inventory"
        description="Keep medicines and batch-level stock easy to find."
        action={
          <button
            className="primary-button"
            data-testid="add-medicine-button"
            onClick={() => setShowAdd(true)}
          >
            <CirclePlus size={17} />
            Add medicine
          </button>
        }
      />

      <div className="inventory-toolbar">
        <div className="search-wrap">
          <Search size={18} />

          <input
            data-testid="inventory-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              load(e.target.value);
            }}
            placeholder="Search medicines…"
          />
        </div>

        <button
          className="secondary-button"
          data-testid="inventory-filter-button"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <section className="workspace-section inventory-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MEDICINE CATALOG</p>
            <h2>{medicines.length} medicines</h2>
          </div>

          <span className="unit-note">
            Stock shown in smallest sellable unit
          </span>
        </div>

        <div className="table-frame">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Pack type</th>
                <th>GST</th>
                <th>Total stock</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="inline-state">
                      Loading medicines…
                    </div>
                  </td>
                </tr>
              ) : medicines.length ? (
                medicines.map((medicine, index) => (
                  <tr
                    key={medicine.id || index}
                    data-testid={`inventory-row-${
                      medicine.id || index
                    }`}
                    onClick={() =>
                      openMedicine(medicine)
                    }
                    className="clickable-row"
                  >
                    <td>
                      <div className="medicine-cell">
                        <span className="medicine-icon">
                          <Pill size={16} />
                        </span>

                        <span>
                          <strong>
                            {getValue(medicine, [
                              "medicine_name",
                              "name",
                            ])}
                          </strong>

                          <small>
                            {getValue(
                              medicine,
                              ["hsn_code", "hsn"],
                              "No HSN code"
                            )}
                          </small>
                        </span>
                      </div>
                    </td>

                    <td>
                      {getValue(
                        medicine,
                        ["pack_type", "packType"],
                        "—"
                      )}
                    </td>

                    <td>
                      {getValue(
                        medicine,
                        ["gst_rate", "gst"],
                        "—"
                      )}
                      %
                    </td>

                    <td>
                      <strong>
                        {getValue(
                          medicine,
                          [
                            "total_stock",
                            "stock_quantity",
                            "stock",
                          ],
                          "—"
                        )}
                      </strong>{" "}
                      units
                    </td>

                    <td>
                      <ArrowRight size={16} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <PackageSearch size={21} />
                      <strong>No medicines found</strong>
                      <span>
                        Try another search or add your first
                        medicine.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
    <MedicineDetail
    medicine={selected}
    batches={batches}
    onClose={() => setSelected(null)}
    onBatchAdded={async () => {
      const { data, error } =
        await api.getMedicineBatches(
          selected.id
        );

      if (error) {
        toast.error(
          "Batch was added, but batches could not be refreshed"
        );
        return;
      }

      setBatches(data || []);
    }}
    onStockAdjusted={async () => {
      const { data, error } =
        await api.getMedicineBatches(
          selected.id
        );

      if (error) {
        toast.error(
          "Stock changed, but batches could not be refreshed"
        );
        return;
      }

      setBatches(data || []);
    }}
  />
)}

      {showAdd && (
        <MedicineForm
          form={form}
          setForm={setForm}
          onSubmit={createMedicine}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function MedicineDetail({
  medicine,
  batches,
  onClose,
  onBatchAdded,
  onStockAdjusted,
}) {
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [addingBatch, setAddingBatch] = useState(false);

  const [adjustingBatch, setAdjustingBatch] = useState(null);
  const [adjustingStock, setAdjustingStock] = useState(false);

  const [batchForm, setBatchForm] = useState({
    batch_number: "",
    expiry_date: "",
    mrp: "",
    initial_stock_quantity: "",
  });

  const [adjustForm, setAdjustForm] = useState({
    quantity_change: "",
    reason: "",
  });

  const updateBatchField = (name, value) => {
    setBatchForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateAdjustField = (name, value) => {
    setAdjustForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submitBatch = async (event) => {
    event.preventDefault();

    if (!batchForm.batch_number.trim()) {
      toast.error("Batch number is required");
      return;
    }

    if (!batchForm.expiry_date) {
      toast.error("Expiry date is required");
      return;
    }

    const mrp = Number(batchForm.mrp);
    const stock = Number(
      batchForm.initial_stock_quantity
    );

    if (!Number.isFinite(mrp) || mrp < 0) {
      toast.error(
        "MRP must be a valid non-negative number"
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error(
        "Initial stock must be a non-negative whole number"
      );
      return;
    }

    setAddingBatch(true);

    const { error } = await api.addBatch({
      medicine_id: medicine.id,
      batch_number: batchForm.batch_number.trim(),
      expiry_date: batchForm.expiry_date,
      mrp,
      initial_stock_quantity: stock,
    });

    if (error) {
      console.error("add_batch error:", error);

      toast.error(
        error.message || "Unable to add batch"
      );

      setAddingBatch(false);
      return;
    }

    toast.success("Batch added successfully");

    setBatchForm({
      batch_number: "",
      expiry_date: "",
      mrp: "",
      initial_stock_quantity: "",
    });

    setShowAddBatch(false);
    setAddingBatch(false);

    if (onBatchAdded) {
      await onBatchAdded();
    }
  };

  const openAdjustStock = (batch) => {
    const currentStock = Number(
      getValue(
        batch,
        [
          "stock_quantity",
          "available_stock",
          "stock",
        ],
        0
      )
    );

    setAdjustingBatch({
      ...batch,
      currentStock,
    });

    setAdjustForm({
      quantity_change: "",
      reason: "",
    });
  };

  const closeAdjustStock = () => {
    if (adjustingStock) return;

    setAdjustingBatch(null);

    setAdjustForm({
      quantity_change: "",
      reason: "",
    });
  };

  const submitStockAdjustment = async (event) => {
    event.preventDefault();

    if (!adjustingBatch) {
      return;
    }

    const quantityChange = Number(
      adjustForm.quantity_change
    );

    const reason = adjustForm.reason.trim();

    if (
      !Number.isInteger(quantityChange) ||
      quantityChange === 0
    ) {
      toast.error(
        "Quantity change must be a non-zero whole number"
      );
      return;
    }

    if (!reason) {
      toast.error("A reason is required");
      return;
    }

    const newStock =
      adjustingBatch.currentStock + quantityChange;

    if (newStock < 0) {
      toast.error(
        `Stock cannot go below zero. Current stock: ${adjustingBatch.currentStock}`
      );
      return;
    }

    setAdjustingStock(true);

    const { data, error } = await api.adjustStock({
      batch_id: adjustingBatch.id,
      quantity_change: quantityChange,
      reason,
    });

    if (error) {
      console.error(
        "adjust_stock error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to adjust stock"
      );

      setAdjustingStock(false);
      return;
    }

    toast.success(
      `Stock updated to ${data?.new_stock ?? newStock} units`
    );

    setAdjustingStock(false);
    setAdjustingBatch(null);

    setAdjustForm({
      quantity_change: "",
      reason: "",
    });

    if (onStockAdjusted) {
      await onStockAdjusted();
    }
  };

  return (
    <div className="overlay">
      <section
        className="drawer"
        data-testid="medicine-detail-drawer"
      >
        <div className="drawer-head">
          <button
            className="icon-button"
            data-testid="close-medicine-detail-button"
            onClick={onClose}
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <p className="eyebrow">
              MEDICINE DETAIL
            </p>

            <h2>
              {getValue(medicine, [
                "medicine_name",
                "name",
              ])}
            </h2>
          </div>

          <button
            className="icon-button"
            data-testid="drawer-close-button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="detail-facts">
          <div>
            <span>Pack type</span>

            <strong>
              {getValue(
                medicine,
                ["pack_type", "packType"],
                "—"
              )}
            </strong>
          </div>

          <div>
            <span>GST rate</span>

            <strong>
              {getValue(
                medicine,
                ["gst_rate", "gst"],
                "—"
              )}
              %
            </strong>
          </div>

          <div>
            <span>Schedule</span>

            <strong>
              {getValue(
                medicine,
                ["schedule"],
                "Schedule C"
              )}
            </strong>
          </div>
        </div>

        <div className="drawer-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                BATCHES
              </p>

              <h3>
                Nearest expiry first
              </h3>
            </div>

            <button
              className="secondary-button"
              data-testid="add-batch-button"
              onClick={() =>
                setShowAddBatch(true)
              }
            >
              <Plus size={16} />
              Add batch
            </button>
          </div>

          {batches.length ? (
            batches.map((batch, i) => (
              <div
                className="drawer-batch"
                data-testid={`detail-batch-${
                  batch.id || i
                }`}
                key={batch.id || i}
              >
                <div>
                  <strong>
                    {getValue(batch, [
                      "batch_number",
                      "batch_no",
                    ])}
                  </strong>

                  <small>
                    Expires{" "}
                    {getValue(batch, [
                      "expiry_date",
                      "expiry",
                    ])}
                  </small>
                </div>

                <div>
                  <strong>
                    {getValue(
                      batch,
                      [
                        "stock_quantity",
                        "available_stock",
                        "stock",
                      ],
                      0
                    )}{" "}
                    units
                  </strong>

                  <small>
                    MRP ₹
                    {getValue(
                      batch,
                      [
                        "mrp",
                        "selling_price",
                      ],
                      "—"
                    )}
                  </small>
                </div>

                <button
                  className="text-button"
                  data-testid={`adjust-stock-button-${
                    batch.id || i
                  }`}
                  onClick={() =>
                    openAdjustStock(batch)
                  }
                >
                  <Settings2 size={15} />
                  Adjust
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <PackageSearch size={19} />

              <span>
                No batches found.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ADD BATCH MODAL */}
      {showAddBatch && (
        <div className="overlay">
          <section
            className="modal"
            data-testid="add-batch-modal"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  INVENTORY
                </p>

                <h2>Add batch</h2>
              </div>

              <button
                className="icon-button"
                data-testid="close-add-batch-modal-button"
                onClick={() =>
                  setShowAddBatch(false)
                }
                disabled={addingBatch}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submitBatch}
              className="modal-form"
            >
              <label>
                Batch number

                <input
                  data-testid="batch-number-input"
                  value={
                    batchForm.batch_number
                  }
                  onChange={(e) =>
                    updateBatchField(
                      "batch_number",
                      e.target.value
                    )
                  }
                  placeholder="e.g. BATCH-001"
                  required
                />
              </label>

              <label>
                Expiry date

                <input
                  data-testid="batch-expiry-input"
                  type="date"
                  value={
                    batchForm.expiry_date
                  }
                  onChange={(e) =>
                    updateBatchField(
                      "expiry_date",
                      e.target.value
                    )
                  }
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  MRP

                  <input
                    data-testid="batch-mrp-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={batchForm.mrp}
                    onChange={(e) =>
                      updateBatchField(
                        "mrp",
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    required
                  />
                </label>

                <label>
                  Initial stock

                  <input
                    data-testid="batch-stock-input"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      batchForm.initial_stock_quantity
                    }
                    onChange={(e) =>
                      updateBatchField(
                        "initial_stock_quantity",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    required
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  data-testid="cancel-add-batch-button"
                  onClick={() =>
                    setShowAddBatch(false)
                  }
                  disabled={addingBatch}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  data-testid="save-batch-button"
                  disabled={addingBatch}
                >
                  <Plus size={16} />

                  {addingBatch
                    ? "Adding batch…"
                    : "Add batch"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {adjustingBatch && (
        <div className="overlay">
          <section
            className="modal"
            data-testid="adjust-stock-modal"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  INVENTORY
                </p>

                <h2>
                  Adjust stock
                </h2>
              </div>

              <button
                className="icon-button"
                data-testid="close-adjust-stock-modal-button"
                onClick={closeAdjustStock}
                disabled={adjustingStock}
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-facts">
              <div>
                <span>Batch</span>

                <strong>
                  {getValue(
                    adjustingBatch,
                    [
                      "batch_number",
                      "batch_no",
                    ],
                    "—"
                  )}
                </strong>
              </div>

              <div>
                <span>Current stock</span>

                <strong>
                  {
                    adjustingBatch.currentStock
                  }{" "}
                  units
                </strong>
              </div>
            </div>

            <form
              onSubmit={
                submitStockAdjustment
              }
              className="modal-form"
            >
              <label>
                Quantity change

                <input
                  data-testid="adjust-stock-quantity-input"
                  type="number"
                  step="1"
                  value={
                    adjustForm.quantity_change
                  }
                  onChange={(e) =>
                    updateAdjustField(
                      "quantity_change",
                      e.target.value
                    )
                  }
                  placeholder="e.g. +20 or -10"
                  required
                />

                <small>
                  Use a positive number to add
                  stock or a negative number to
                  remove stock.
                </small>
              </label>

              <label>
                Reason

                <input
                  data-testid="adjust-stock-reason-input"
                  value={adjustForm.reason}
                  onChange={(e) =>
                    updateAdjustField(
                      "reason",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Stock received, damaged, correction"
                  required
                />
              </label>

              {adjustForm.quantity_change !==
                "" &&
                Number.isInteger(
                  Number(
                    adjustForm.quantity_change
                  )
                ) &&
                Number(
                  adjustForm.quantity_change
                ) !== 0 && (
                  <div className="inline-state">
                    New stock:{" "}
                    <strong>
                      {Math.max(
                        0,
                        adjustingBatch.currentStock +
                          Number(
                            adjustForm.quantity_change
                          )
                      )}{" "}
                      units
                    </strong>
                  </div>
                )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  data-testid="cancel-adjust-stock-button"
                  onClick={closeAdjustStock}
                  disabled={adjustingStock}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  data-testid="save-adjust-stock-button"
                  disabled={adjustingStock}
                >
                  <Settings2 size={16} />

                  {adjustingStock
                    ? "Updating…"
                    : "Adjust stock"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function MedicineForm({
  form,
  setForm,
  onSubmit,
  onClose,
}) {
  const field = (name, value) =>
    setForm({
      ...form,
      [name]: value,
    });

  return (
    <div className="overlay">
      <section
        className="modal"
        data-testid="add-medicine-modal"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">INVENTORY</p>
            <h2>Add medicine</h2>
          </div>

          <button
            className="icon-button"
            data-testid="close-add-medicine-modal-button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="modal-form"
        >
          <label>
            Medicine name
            <input
              data-testid="medicine-name-input"
              value={form.medicine_name}
              onChange={(e) =>
                field(
                  "medicine_name",
                  e.target.value
                )
              }
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Pack type
              <select
                data-testid="pack-type-select"
                value={form.pack_type}
                onChange={(e) =>
                  field(
                    "pack_type",
                    e.target.value
                  )
                }
              >
                <option>Strip</option>
                <option>Cream/Ointment</option>
                <option>Spray</option>
                <option>Powder</option>
                <option>Injection</option>
                <option>Syrup</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              GST %
              <input
                data-testid="gst-rate-input"
                type="number"
                min="0"
                value={form.gst_rate}
                onChange={(e) =>
                  field(
                    "gst_rate",
                    e.target.value
                  )
                }
                required
              />
            </label>
          </div>

          {form.pack_type === "Strip" && (
            <label>
              Tablets per strip
              <input
                data-testid="tablets-per-strip-input"
                type="number"
                min="1"
                value={form.tablets_per_strip}
                onChange={(e) =>
                  field(
                    "tablets_per_strip",
                    e.target.value
                  )
                }
                required
              />
            </label>
          )}

          <div className="form-grid">
            <label>
              HSN code
              <input
                data-testid="hsn-code-input"
                value={form.hsn_code}
                onChange={(e) =>
                  field(
                    "hsn_code",
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Schedule
              <select
                data-testid="schedule-select"
                value={form.schedule}
                onChange={(e) =>
                  field(
                    "schedule",
                    e.target.value
                  )
                }
              >
                <option>Schedule C</option>
                <option>Schedule H</option>
                <option>Schedule H1</option>
                <option>OTC</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              data-testid="cancel-add-medicine-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              data-testid="save-medicine-button"
            >
              <Plus size={16} />
              Add medicine
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Tracker() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [voidingBill, setVoidingBill] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [returningBill, setReturningBill] = useState(false);
  const [billReturns, setBillReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const loadBills = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_bills", {
      p_search: search.trim() || null,
      p_status: status || null,
      p_payment_mode: paymentMode || null,
      p_from_date: null,
      p_to_date: null,
      p_limit: 50,
      p_offset: 0,
    });

    if (error) {
      console.error("get_bills error:", error);
      toast.error(error.message || "Unable to load bill history");
      setBills([]);
    } else {
      setBills(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBills();
  }, [status, paymentMode]);

  const openBill = async (bill) => {
    setSelectedBill(null);
    setBillReturns([]);
    setDetailsLoading(true);
    setReturnsLoading(true);

    const [detailsResult, returnsResult] =
      await Promise.all([
        supabase.rpc("get_bill_details", {
          p_bill_id: bill.id,
        }),

        supabase.rpc("get_bill_returns", {
          p_bill_id: bill.id,
        }),
      ]);

    const { data: detailsData, error: detailsError } =
      detailsResult;

    const { data: returnsData, error: returnsError } =
      returnsResult;

    if (detailsError) {
      console.error(
        "get_bill_details error:",
        detailsError
      );

      toast.error(
        detailsError.message ||
          "Unable to load bill details"
      );
    } else {
      setSelectedBill(detailsData);
    }

    if (returnsError) {
      console.error(
        "get_bill_returns error:",
        returnsError
      );

      toast.error(
        returnsError.message ||
          "Unable to load return history"
      );

      setBillReturns([]);
    } else {
      setBillReturns(
        returnsData?.returns || []
      );
    }

    setDetailsLoading(false);
    setReturnsLoading(false);
  };

  const confirmVoidBill = async () => {
    if (!selectedBill?.bill?.id) {
      return;
    }

    setVoidingBill(true);

    const { data, error } = await api.voidBill(
      selectedBill.bill.id
    );

    if (error) {
      console.error("void_bill error:", error);

      toast.error(
        error.message || "Unable to void bill"
      );

      setVoidingBill(false);
      return;
    }

    toast.success(
      data?.bill_number
        ? `Bill ${data.bill_number} voided successfully`
        : "Bill voided successfully"
    );

    setVoidingBill(false);
    setShowVoidConfirm(false);

    // Refresh the tracker list
    await loadBills();

    // Refresh the currently open bill
    await openBill({
      id: selectedBill.bill.id,
    });
  };

  const openReturnModal = () => {
    if (!selectedBill?.bill || !selectedBill?.items?.length) {
      toast.error("No bill items available for return");
      return;
    }

    const initialQuantities = {};

    selectedBill.items.forEach((item) => {
      initialQuantities[item.id] = 0;
    });

    setReturnQuantities(initialQuantities);
    setShowReturnModal(true);
  };

  const updateReturnQuantity = (itemId, value, max) => {
    const numeric = Number(value);

    const safeValue = Math.max(
      0,
      Math.min(
        Number.isFinite(numeric) ? Math.floor(numeric) : 0,
        max
      )
    );

    setReturnQuantities((current) => ({
      ...current,
      [itemId]: safeValue,
    }));
  };

  const confirmReturn = async () => {
    if (!selectedBill?.bill?.id) {
      return;
    }

    const returnItems = selectedBill.items
      .map((item) => ({
        bill_item_id: item.id,
        quantity: Number(returnQuantities[item.id] || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (!returnItems.length) {
      toast.error("Select at least one item to return");
      return;
    }

    setReturningBill(true);

    const { data, error } = await supabase.rpc("create_return", {
      p_bill_id: selectedBill.bill.id,
      p_items: returnItems,
    });

    if (error) {
      console.error("create_return error:", error);

      toast.error(
        error.message || "Unable to process return"
      );

      setReturningBill(false);
      return;
    }

    toast.success(
      data?.total_amount !== undefined
        ? `Return processed — ₹${Number(
            data.total_amount
          ).toFixed(2)}`
        : "Return processed successfully"
    );

    setReturningBill(false);
    setShowReturnModal(false);
    setReturnQuantities({});

    // Refresh tracker list
    await loadBills();

    // Refresh the bill currently open
    await openBill({
      id: selectedBill.bill.id,
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const completedCount = bills.filter(
    (bill) => bill.status === "completed"
  ).length;

  const voidedCount = bills.filter(
    (bill) => bill.status === "voided"
  ).length;

  const totalAmount = bills
    .filter((bill) => bill.status === "completed")
    .reduce(
      (sum, bill) =>
        sum +
        Number(bill.total_amount || 0) -
        Number(bill.returned_amount || 0),
      0
    );

  const returnedByBillItem = {};

  billReturns.forEach((returnRecord) => {
    (returnRecord.items || []).forEach((item) => {
      returnedByBillItem[item.bill_item_id] =
        (returnedByBillItem[item.bill_item_id] || 0) +
        Number(item.quantity || 0);
    });
  });

  const totalReturnedQuantity =
    Object.values(returnedByBillItem).reduce(
      (sum, quantity) => sum + quantity,
      0
    );

  const totalOriginalQuantity =
    selectedBill?.items?.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    ) || 0;

  const totalReturnableQuantity = Math.max(
    0,
    totalOriginalQuantity -
      totalReturnedQuantity
  );

  const totalReturnedAmount =
    billReturns.reduce(
      (sum, returnRecord) =>
        sum +
        Number(returnRecord.total_amount || 0),
      0
    );
  return (
    <div className="page">
      <PageHeader
        eyebrow="DAILY ACTIVITY"
        title="Bill history"
        description="Search and review bills created by your pharmacy."
        action={
          <span className="status-pill">
            <span /> Backend connected
          </span>
        }
      />

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BILL TRACKER</p>
            <h2>Recent bills</h2>
          </div>

          <button
            className="secondary-button"
            onClick={loadBills}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="inventory-toolbar">
          <div className="search-wrap">
            <Search size={18} />

            <input
              data-testid="bill-history-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadBills();
                }
              }}
              placeholder="Search bill number or patient…"
            />

            {search && (
              <button
                className="clear-button"
                onClick={() => {
                  setSearch("");
                  setTimeout(loadBills, 0);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            className="table-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="voided">Voided</option>
          </select>

          <select
            className="table-input"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="">All payments</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>

          <button
            className="primary-button"
            onClick={loadBills}
            disabled={loading}
          >
            <Search size={16} />
            Search
          </button>
        </div>

        <div className="detail-facts">
          <div>
            <span>Shown</span>
            <strong>{bills.length}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>

          <div>
            <span>Voided</span>
            <strong>{voidedCount}</strong>
          </div>

          <div>
            <span>Completed value</span>
            <strong>
              ₹{totalAmount.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="table-frame">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>Patient</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="inline-state">
                      Loading bill history…
                    </div>
                  </td>
                </tr>
              ) : bills.length ? (
                bills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="clickable-row"
                    data-testid={`bill-history-row-${bill.id}`}
                    onClick={() => openBill(bill)}
                  >
                    <td>
                      <strong>
                        {bill.bill_number}
                      </strong>

                      <small>
                        {bill.doctor_name
                          ? `Dr. ${bill.doctor_name}`
                          : "No doctor recorded"}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {bill.patient_name}
                      </strong>
                    </td>

                    <td>
                      {bill.payment_mode}
                    </td>

                    <td>
                      <span className={`status-pill ${
                        bill.status === "voided"
                          ? "status-pill-voided"
                          : "status-pill-completed"
                      }`}>
                        <span />
                        {bill.status}
                      </span>
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          bill.total_amount || 0
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {formatDate(
                        bill.created_at
                      )}
                    </td>

                    <td>
                      <ArrowRight size={16} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <FileText size={21} />

                      <strong>
                        No bills found
                      </strong>

                      <span>
                        Try another search or create
                        your first bill.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailsLoading && (
        <div className="overlay">
          <section className="modal">
            <div className="inline-state">
              Loading bill details…
            </div>
          </section>
        </div>
      )}

      {selectedBill && (
        <div className="overlay">
          <section
            className="drawer"
            data-testid="bill-detail-drawer"
          >
            <div className="drawer-head">
              <button
                className="icon-button"
                onClick={() => setSelectedBill(null)}
              >
                <ChevronLeft size={18} />
              </button>

              <div>
                <p className="eyebrow">
                  BILL DETAILS
                </p>

                <h2>
                  {selectedBill.bill?.bill_number ||
                    "Bill"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setSelectedBill(null)}
              >
                <X size={18} />
              </button>
            </div>
            

            {selectedBill.bill && (
              <>
                <div className="detail-facts">
                  <div>
                    <span>Patient</span>
                    <strong>
                      {selectedBill.bill.patient_name}
                    </strong>
                  </div>

                  <div>
                    <span>Doctor</span>
                    <strong>
                      {selectedBill.bill.doctor_name ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      {selectedBill.bill.payment_mode}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {selectedBill.bill.status}
                    </strong>
                  </div>
                </div>

                <div className="drawer-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">
                        ITEMS
                      </p>

                      <h3>
                        {selectedBill.items?.length ||
                          0}{" "}
                        items
                      </h3>
                    </div>
                  </div>

                  {selectedBill.items?.length ? (
                    selectedBill.items.map((item) => (
                      <div
                        className="drawer-batch"
                        key={item.id}
                      >
                        <div>
                          <strong>
                            {item.medicine_name}
                          </strong>

                          <small>
                            Batch{" "}
                            {item.batch_number}
                          </small>
                        </div>

                        <div>
                          <strong>
                            {item.quantity} × ₹
                            {Number(
                              item.unit_price || 0
                            ).toFixed(2)}
                          </strong>

                          <small>
                            GST {item.gst_rate}%
                          </small>
                        </div>

                        <div>
                          <strong>
                            ₹
                            {Number(
                              item.line_total || 0
                            ).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                      
                    ))
                  ) : (
                    <div className="empty-state compact">
                      <span>
                        No bill items found.
                      </span>
                    </div>
                  )}
                </div>

                {!returnsLoading &&
                selectedBill.bill?.status === "completed" &&
                totalOriginalQuantity > 0 && (
                  <div
                    style={{
                      marginTop: "16px",
                      marginBottom: "16px",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                    }}
                    data-testid="bill-return-summary"
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      Return status
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        Returned:{" "}
                        <strong>
                          {totalReturnedQuantity}
                        </strong>{" "}
                        units
                      </span>

                      <span>
                        Returnable:{" "}
                        <strong>
                          {totalReturnableQuantity}
                        </strong>{" "}
                        units
                      </span>

                      <span>
                        Returned value:{" "}
                        <strong>
                          ₹{totalReturnedAmount.toFixed(2)}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ₹
                      {Number(
                        selectedBill.bill.subtotal ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>GST</span>
                    <strong>
                      ₹
                      {Number(
                        selectedBill.bill.gst_amount ||
                          0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>
                      -₹
                      {Number(
                        selectedBill.bill
                          .discount_amount || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="total-line">
                    <span>Total</span>
                    <strong>
                      ₹
                      {Number(
                        selectedBill.bill
                          .total_amount || 0
                      ).toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    {selectedBill.bill?.status === "completed" && (
                          <div className="billing-actions">
                            <button
                              className="secondary-button"
                              data-testid="return-bill-button"
                              onClick={openReturnModal}
                              disabled={returningBill}
                            >
                              Return
                            </button>

                            <button
                              className="primary-button"
                              data-testid="void-bill-button"
                              onClick={() => setShowVoidConfirm(true)}
                              disabled={voidingBill}
                            >
                              {voidingBill
                                ? "Voiding…"
                                : "Void bill"}
                            </button>
                          </div>
                        )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {showVoidConfirm && selectedBill?.bill && (
        <div className="overlay">
          <section
            className="modal"
            data-testid="void-bill-confirm-modal"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  BILL ACTION
                </p>

                <h2>Void bill?</h2>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setShowVoidConfirm(false)
                }
                disabled={voidingBill}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inline-state">
              Are you sure you want to void bill{" "}
              <strong>
                {selectedBill.bill.bill_number}
              </strong>
              ?
              <br />
              <br />
              This will mark the bill as voided and
              restore its sold stock.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowVoidConfirm(false)
                }
                disabled={voidingBill}
              >
                No, keep bill
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={confirmVoidBill}
                disabled={voidingBill}
              >
                {voidingBill
                  ? "Voiding…"
                  : "Yes, void bill"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showReturnModal && selectedBill?.bill && (
        <div className="overlay">
          <section
            className="modal"
            data-testid="return-bill-modal"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  BILL ACTION
                </p>

                <h2>
                  Return items
                </h2>
              </div>

              <button
                className="icon-button"
                data-testid="close-return-modal-button"
                onClick={() => {
                  if (!returningBill) {
                    setShowReturnModal(false);
                  }
                }}
                disabled={returningBill}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inline-state">
              Select the quantity you want to return from bill{" "}
              <strong>
                {selectedBill.bill.bill_number}
              </strong>
              .
            </div>

            <div
              className="drawer-section"
              style={{
                maxHeight: "420px",
                overflowY: "auto",
              }}
            >
              {selectedBill.items?.map((item) => {
                const originalQuantity =
                  Number(item.quantity) || 0;

                const returnQuantity =
                  Number(returnQuantities[item.id] || 0);

                return (
                  <div
                    className="drawer-batch"
                    key={item.id}
                    data-testid={`return-item-${item.id}`}
                  >
                    <div>
                      <strong>
                        {item.medicine_name}
                      </strong>

                      <small>
                        Batch {item.batch_number}
                      </small>
                    </div>

                    <div>
                      <strong>
                        {originalQuantity} sold
                      </strong>

                      <small>
                        ₹
                        {Number(
                          item.line_total || 0
                        ).toFixed(2)}
                      </small>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>Return</span>

                        <input
                          className="table-input"
                          data-testid={`return-quantity-input-${item.id}`}
                          type="number"
                          min="0"
                          max={originalQuantity}
                          step="1"
                          value={returnQuantity}
                          onChange={(e) =>
                            updateReturnQuantity(
                              item.id,
                              e.target.value,
                              originalQuantity
                            )
                          }
                          disabled={returningBill}
                          style={{
                            width: "80px",
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                data-testid="cancel-return-button"
                onClick={() =>
                  setShowReturnModal(false)
                }
                disabled={returningBill}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                data-testid="confirm-return-button"
                onClick={confirmReturn}
                disabled={returningBill}
              >
                {returningBill
                  ? "Processing return…"
                  : "Confirm return"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function PharmacyDetails() {
  const [details, setDetails] = useState({
    pharmacy_type: "",
    pharmacy_name: "",
    proprietor_name: "",
    phone: "",
    email: "",
    address: "",
    drug_license: "",
    gstin_tax_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadDetails = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_pharmacy_details"
    );

    if (error) {
      console.error(
        "get_pharmacy_details error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to load pharmacy details"
      );

      setLoading(false);
      return;
    }

    /*
     * If no pharmacy_details row exists yet,
     * the backend returns:
     *
     * {
     *   exists: false,
     *   store_id: ...
     * }
     *
     * In that case we simply keep the empty
     * form ready for the first save.
     */
    if (data?.exists === false) {
      setDetails({
        pharmacy_type: "",
        pharmacy_name: "",
        proprietor_name: "",
        phone: "",
        email: "",
        address: "",
        drug_license: "",
        gstin_tax_id: "",
      });
    } else if (data) {
      setDetails({
        pharmacy_type: data.pharmacy_type || "",
        pharmacy_name: data.pharmacy_name || "",
        proprietor_name:
          data.proprietor_name || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        drug_license:
          data.drug_license || "",
        gstin_tax_id:
          data.gstin_tax_id || "",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const updateField = (field, value) => {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveClick = () => {
    if (!details.pharmacy_type.trim()) {
      toast.error("Pharmacy type is required");
      return;
    }

    if (!details.pharmacy_name.trim()) {
      toast.error("Pharmacy name is required");
      return;
    }

    if (!details.proprietor_name.trim()) {
      toast.error("Proprietor name is required");
      return;
    }

    if (!details.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!details.address.trim()) {
      toast.error("Address is required");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);

    const { data, error } =
      await supabase.rpc(
        "update_pharmacy_details",
        {
          p_pharmacy_type:
            details.pharmacy_type.trim(),

          p_pharmacy_name:
            details.pharmacy_name.trim(),

          p_proprietor_name:
            details.proprietor_name.trim(),

          p_phone:
            details.phone.trim(),

          p_email:
            details.email.trim() || null,

          p_address:
            details.address.trim(),

          p_drug_license:
            details.drug_license.trim() || null,

          p_gstin_tax_id:
            details.gstin_tax_id.trim() || null,
        }
      );

    if (error) {
      console.error(
        "update_pharmacy_details error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to save pharmacy details"
      );

      setSaving(false);
      return;
    }

    toast.success(
      data?.message ||
        "Pharmacy details saved successfully"
    );

    await loadDetails();

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="PHARMACY"
          title="Pharmacy details"
          description="Manage the information used throughout your pharmacy."
        />

        <section className="workspace-section">
          <div className="inline-state">
            Loading pharmacy details…
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="PHARMACY"
        title="Pharmacy details"
        description="Manage the information used throughout your pharmacy."
        action={
          <span className="status-pill">
            <span /> Backend connected
          </span>
        }
      />

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              PHARMACY INFORMATION
            </p>

            <h2>Business details</h2>
          </div>

          <span className="unit-note">
            Changes require confirmation before saving
          </span>
        </div>

        <div className="billing-meta">
          <label>
            Pharmacy Type

            <input
              value={details.pharmacy_type}
              onChange={(e) =>
                updateField(
                  "pharmacy_type",
                  e.target.value
                )
              }
              placeholder="e.g. Retail Pharmacy"
            />
          </label>

          <label>
            Pharmacy Name

            <input
              value={details.pharmacy_name}
              onChange={(e) =>
                updateField(
                  "pharmacy_name",
                  e.target.value
                )
              }
              placeholder="Pharmacy name"
            />
          </label>

          <label>
            Proprietor Name

            <input
              value={details.proprietor_name}
              onChange={(e) =>
                updateField(
                  "proprietor_name",
                  e.target.value
                )
              }
              placeholder="Proprietor name"
            />
          </label>

          <label>
            Phone

            <input
              type="tel"
              value={details.phone}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value
                )
              }
              placeholder="Phone number"
            />
          </label>

          <label>
            Email

            <input
              type="email"
              value={details.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
              placeholder="Email address"
            />
          </label>

          <label>
            Drug License

            <input
              value={details.drug_license}
              onChange={(e) =>
                updateField(
                  "drug_license",
                  e.target.value
                )
              }
              placeholder="Drug license number"
            />
          </label>

          <label>
            GSTIN / Tax ID

            <input
              value={details.gstin_tax_id}
              onChange={(e) =>
                updateField(
                  "gstin_tax_id",
                  e.target.value
                )
              }
              placeholder="GSTIN / Tax ID"
            />
          </label>

          <label
            style={{
              gridColumn: "1 / -1",
            }}
          >
            Address

            <textarea
              value={details.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
              placeholder="Pharmacy address"
              rows={4}
            />
          </label>
        </div>

        <div className="billing-actions">
          <span className="pending-note">
            Make sure the information is correct
            before saving.
          </span>

          <button
            className="primary-button"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving
              ? "Saving details…"
              : "Save details"}
          </button>
        </div>
      </section>

      {showConfirm && (
        <div className="overlay">
          <section className="modal">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  CONFIRM CHANGE
                </p>

                <h2>
                  Are you sure you want to
                  change details?
                </h2>
              </div>
            </div>

            <p>
              The pharmacy information currently
              entered will replace the existing
              details.
            </p>

            <div className="billing-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={saving}
              >
                No
              </button>

              <button
                className="primary-button"
                onClick={confirmSave}
                disabled={saving}
              >
                Yes, save details
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(undefined);
  const [active, setActive] = useState("billing");

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) =>
        setSession(data.session)
      );

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, next) => setSession(next)
      );

    return () =>
      listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const content = useMemo(
    () =>
      active === "billing" ? (
        <Billing />
      ) : active === "inventory" ? (
        <Inventory />
      ) : active === "tracker" ? (
        <Tracker />
      ) : active === "pharmacy" ? (
        <PharmacyDetails />
      ) : null,
    [active]
  );

  if (session === undefined) {
    return (
      <div
        className="loading-screen"
        data-testid="auth-loading-state"
      >
        Checking your session…
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        richColors
      />

      {session ? (
        <Shell
          session={session}
          onLogout={logout}
          active={active}
          setActive={setActive}
        >
          {content}
        </Shell>
      ) : (
        <Login onLogin={setSession} />
      )}
    </>
  );
}

export default App;