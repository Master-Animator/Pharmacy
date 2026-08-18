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
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

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
    }

    setMedicines(data || []);
    setLoading(false);
  };

  const chooseMedicine = async (medicine) => {
    setSelected(medicine);
    setMedicines([]);
    setQuery("");
    setBatchLoading(true);

    const { data, error } =
      await api.getMedicineBatches(medicine.id);

    if (error) {
      toast.error("Unable to load batches");
    }

    setBatches(data || []);
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
      return toast.error(
        "This batch has no available stock"
      );
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

  const updateItem = (index, field, value) =>
    setItems(
      items.map((item, i) => {
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

        return {
          ...item,
          [field]: Math.max(
            field === "quantity" ? 1 : 0,
            Math.min(
              Number.isFinite(numeric) ? numeric : 0,
              max
            )
          ),
        };
      })
    );

  return (
    <div className="page">
      <PageHeader
        eyebrow="COUNTER / BILLING"
        title="New bill"
        description="Create a bill with explicit batch and quantity control."
        action={
          <span className="status-pill">
            <span />
            Backend connected
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
            placeholder="Optional"
          />
        </label>

        <label>
          Doctor name
          <input
            data-testid="doctor-name-input"
            placeholder="Optional"
          />
        </label>

        <label>
          Payment mode
          <select
            data-testid="payment-mode-select"
            defaultValue="Cash"
          >
            <option>Cash</option>
            <option>UPI</option>
          </select>
        </label>
      </section>

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ADD MEDICINE</p>
            <h2>Find a medicine</h2>
          </div>

          <span className="unit-note">
            Quantities are entered in smallest sellable units
          </span>
        </div>

        <div className="search-wrap">
          <Search size={18} />

          <input
            data-testid="medicine-search-input"
            value={query}
            onChange={(e) => search(e.target.value)}
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
              medicines.map((m) => (
                <button
                  className="search-result"
                  data-testid={`medicine-result-${m.id}`}
                  key={m.id}
                  onClick={() => chooseMedicine(m)}
                >
                  <span className="result-icon">
                    <Pill size={16} />
                  </span>

                  <span>
                    <strong>
                      {getValue(m, [
                        "medicine_name",
                        "name",
                      ])}
                    </strong>

                    <small>
                      {getValue(
                        m,
                        ["pack_type", "packType"],
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
                <p className="eyebrow">SELECT BATCH</p>
                <h3>
                  {getValue(selected, [
                    "medicine_name",
                    "name",
                  ])}
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
                    data-testid={`batch-option-${
                      batch.id || i
                    }`}
                    onClick={() => addLine(batch)}
                  >
                    <span>
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
                          ["mrp", "selling_price"],
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
                  No batches available for this medicine.
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BILL ITEMS</p>
            <h2>
              {items.length
                ? `${items.length} item${
                    items.length > 1 ? "s" : ""
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
                <th>Discount</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((item, index) => (
                  <tr
                    key={`${item.batch.id || index}`}
                    data-testid={`bill-item-row-${index}`}
                  >
                    <td>
                      <strong>
                        {getValue(item.medicine, [
                          "medicine_name",
                          "name",
                        ])}
                      </strong>

                      <small>
                        {getValue(
                          item.medicine,
                          ["pack_type", "packType"],
                          "Unit"
                        )}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {getValue(item.batch, [
                          "batch_number",
                          "batch_no",
                        ])}
                      </strong>

                      <small>
                        {getValue(item.batch, [
                          "expiry_date",
                          "expiry",
                        ])}
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
                      {getValue(
                        item.batch,
                        ["mrp", "selling_price"],
                        "—"
                      )}
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
                    </td>

                    <td>
                      <button
                        className="icon-button danger"
                        data-testid={`remove-bill-item-${index}`}
                        onClick={() =>
                          setItems(
                            items.filter(
                              (_, i) => i !== index
                            )
                          )
                        }
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <FileText size={20} />
                      <strong>No items added yet</strong>
                      <span>
                        Search above and choose a batch to
                        begin.
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
                defaultValue="0"
              />
              <span>%</span>
            </div>
          </label>

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <strong data-testid="bill-subtotal">
                —
              </strong>
            </div>

            <div>
              <span>GST</span>
              <strong data-testid="bill-gst">
                —
              </strong>
            </div>

            <div className="total-line">
              <span>Total</span>
              <strong data-testid="bill-total">
                —
              </strong>
            </div>
          </div>
        </div>

        <div className="billing-actions">
          <span
            className="pending-note"
            data-testid="create-bill-pending-note"
          >
            Bill creation is ready for the verified
            create_bill RPC contract.
          </span>

          <button
            className="primary-button"
            data-testid="generate-bill-button"
            disabled
          >
            <FileText size={17} />
            Generate bill
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
}) {
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
            <p className="eyebrow">MEDICINE DETAIL</p>
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
              <p className="eyebrow">BATCHES</p>
              <h3>Nearest expiry first</h3>
            </div>

            <button
              className="secondary-button"
              data-testid="add-batch-button"
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
                      ["mrp", "selling_price"],
                      "—"
                    )}
                  </small>
                </div>

                <button
                  className="text-button"
                  data-testid={`adjust-stock-button-${
                    batch.id || i
                  }`}
                >
                  <Settings2 size={15} />
                  Adjust
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <PackageSearch size={19} />
              <span>No batches found.</span>
            </div>
          )}
        </div>
      </section>
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
                <option>Tablet</option>
                <option>Capsule</option>
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

function PlaceholderPage({
  type,
  title,
  description,
  icon: Icon,
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow={type}
        title={title}
        description={description}
      />

      <section
        className="placeholder-panel"
        data-testid={`${type.toLowerCase()}-placeholder`}
      >
        <span className="placeholder-icon">
          <Icon size={23} />
        </span>

        <h2>We’re preparing this workspace</h2>

        <p>
          The visual foundation is ready. This area will
          connect to the verified backend contract next.
        </p>

        <button
          className="secondary-button"
          data-testid={`${type.toLowerCase()}-placeholder-action`}
          disabled
        >
          Coming next
        </button>
      </section>
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
        <PlaceholderPage
          type="TRACKER"
          title="Tracker"
          description="See daily activity and bill history at a glance."
          icon={Activity}
        />
      ) : (
        <PlaceholderPage
          type="PHARMACY"
          title="Pharmacy information"
          description="Keep the details that will appear on every printable bill."
          icon={Store}
        />
      ),
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