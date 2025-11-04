export type SupportedLanguage = "en" | "fil";

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    clients: string;
    orders: string;
    designs: string;
    cutting: string;
    printing: string;
    sewing: string;
    qualityControl: string;
    finishing: string;
    delivery: string;
    finance: string;
    hr: string;
    maintenance: string;
    inventory: string;
    settings: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    yes: string;
    no: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    reset: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    recentOrders: string;
    pendingTasks: string;
    statistics: string;
  };

  // Orders
  orders: {
    title: string;
    newOrder: string;
    orderNumber: string;
    client: string;
    status: string;
    quantity: string;
    dueDate: string;
    totalAmount: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    nav: {
      dashboard: "Dashboard",
      clients: "Clients",
      orders: "Orders",
      designs: "Design & Approval",
      cutting: "Cutting Operations",
      printing: "Printing Operations",
      sewing: "Sewing Operations",
      qualityControl: "Quality Control",
      finishing: "Finishing & Packing",
      delivery: "Delivery Management",
      finance: "Finance",
      hr: "HR & Payroll",
      maintenance: "Maintenance",
      inventory: "Inventory",
      settings: "Settings",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      close: "Close",
      back: "Back",
      next: "Next",
      submit: "Submit",
      reset: "Reset",
    },
    dashboard: {
      welcome: "Welcome to Ashley AI",
      overview: "Overview",
      recentOrders: "Recent Orders",
      pendingTasks: "Pending Tasks",
      statistics: "Statistics",
    },
    orders: {
      title: "Orders",
      newOrder: "New Order",
      orderNumber: "Order Number",
      client: "Client",
      status: "Status",
      quantity: "Quantity",
      dueDate: "Due Date",
      totalAmount: "Total Amount",
    },
  },
  fil: {
    nav: {
      dashboard: "Dashboard",
      clients: "Mga Kliyente",
      orders: "Mga Order",
      designs: "Disenyo at Pag-apruba",
      cutting: "Pagputol ng Tela",
      printing: "Pag-print",
      sewing: "Pagtahi",
      qualityControl: "Quality Control",
      finishing: "Pagtapos at Pag-empake",
      delivery: "Delivery Management",
      finance: "Pinansya",
      hr: "HR at Payroll",
      maintenance: "Maintenance",
      inventory: "Imbentaryo",
      settings: "Mga Setting",
    },
    common: {
      save: "I-save",
      cancel: "Kanselahin",
      delete: "Burahin",
      edit: "I-edit",
      add: "Magdagdag",
      search: "Maghanap",
      filter: "I-filter",
      export: "I-export",
      import: "Mag-import",
      loading: "Naglo-load...",
      error: "May Mali",
      success: "Matagumpay",
      confirm: "Kumpirmahin",
      yes: "Oo",
      no: "Hindi",
      close: "Isara",
      back: "Bumalik",
      next: "Susunod",
      submit: "Isumite",
      reset: "I-reset",
    },
    dashboard: {
      welcome: "Maligayang Pagdating sa Ashley AI",
      overview: "Buod",
      recentOrders: "Kamakailang mga Order",
      pendingTasks: "Mga Nakabinbing Gawain",
      statistics: "Mga Istatistika",
    },
    orders: {
      title: "Mga Order",
      newOrder: "Bagong Order",
      orderNumber: "Numero ng Order",
      client: "Kliyente",
      status: "Katayuan",
      quantity: "Dami",
      dueDate: "Deadline",
      totalAmount: "Kabuuang Halaga",
    },
  },
};
