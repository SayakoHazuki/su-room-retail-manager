import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import TransactionCreator from "./components/TransactionCreator";

const supabase = createClient(
  "https://xdpbawvslvsfegixbmqf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGJhd3ZzbHZzZmVnaXhibXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM0ODIwOTIsImV4cCI6MTk5OTA1ODA5Mn0.qnH34b2_6jfSlzIRRKpyuD3VFGJUDaMOAIIEKrq25lI"
);
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function App() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    getRecords();
  }, []);

  async function getRecords() {
    const { data } = await supabase
      .from("records")
      .select<"*", TransactionRecord>();
    if (!data) {
      setRecords([]);
    } else {
      setRecords(data);
    }
    const dbRes = await supabase.from("items").select<"*", Item>();
    const data2 = dbRes.data
    if (!data2) {
      setItems([]);
    } else {
      setItems(data2);
    }
  }

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Transaction History" {...a11yProps(0)} />
          <Tab label="New transaction" {...a11yProps(1)} />
          <Tab label="Statistics" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <DataTable records={records} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TransactionCreator itemsDict={items} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </div>
  );
}

export default App;

const columns: GridColDef[] = [
  // { field: "id", }
  {
    field: "date",
    headerName: "Date",
    width: 120,
    sortComparator: (a, b) => {
      if (a.split("/").length < 2 || b.split("/").length < 2) return 1;
      let [da, ma, ya] = a.split("/");
      let [db, mb, yb] = b.split("/");
      if (!ya) ya = new Date().getFullYear();
      if (!yb) yb = new Date().getFullYear();
      if (ya !== yb) return ya > yb ? 1 : -1;
      if (ma !== mb) return ma > mb ? 1 : -1;
      return da > db ? 1 : -1;
    },
  },
  { field: "staff", headerName: "Staff", width: 130 },
  {
    field: "item",
    headerName: "Item",
    width: 350,
  },
  {
    field: "quantity",
    headerName: "Qty.",
    type: "number",
    width: 90,
  },
  { field: "price", headerName: "Price", type: "number", width: 90 },
];

function DataTable({ records }: { records: TransactionRecord[] }) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={records}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [
              {
                field: "date",
                sort: "desc",
              },
            ],
          },
        }}
        pageSizeOptions={[10, 15, 25, 50, 100]}
        checkboxSelection
        getRowId={(record) => record.transaction_id}
      />
    </div>
  );
}
