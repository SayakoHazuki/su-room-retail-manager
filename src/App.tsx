import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import TransactionCreator from "./components/TransactionCreator";

import "./App.css";
import TransactionHistory from "./components/TransactionHistory";

const supabase = createClient(
  "https://xdpbawvslvsfegixbmqf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcGJhd3ZzbHZzZmVnaXhibXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM0ODIwOTIsImV4cCI6MTk5OTA1ODA5Mn0.qnH34b2_6jfSlzIRRKpyuD3VFGJUDaMOAIIEKrq25lI"
);
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

//@ts-ignore
window.supabase = supabase;

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

const tabsMap = [
  {
    value: 0,
    label: "history",
  },
  {
    value: 1,
    label: "create"
  }

]

function getTabValue(tab: string | null) {
  if (!tab) return 0;
  const tabValue = tabsMap.find((t) => t.label === tab);
  if (!tabValue) return 0;
  return tabValue.value;
}

function getTabLabel(value: number) {
  const tabValue = tabsMap.find((t) => t.value === value);
  if (!tabValue) return "";
  return tabValue.label;
}


function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");
  
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [value, setValue] = useState(getTabValue(page ?? null));

  function goTo (tab: number) {
    console.log("going to", tab)
    // write params
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", getTabLabel(tab));
    window.history.replaceState(
      null,
      "",
      window.location.pathname + "?" + urlParams.toString()
    );

    setValue(tab);
    console.log("went to", value)
  }


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    getRecords();
    goTo(newValue);
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
    const data2 = dbRes.data;
    if (!data2) {
      setItems([]);
    } else {
      setItems(data2);
    }
  }

  const getItemName = (id: string) => {
    const item = items.find((item) => item.id === id);
    return item ? item.title : `Unknown product <${id}>`;
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="售賣紀錄" {...a11yProps(0)} />
          <Tab label="新增紀錄" {...a11yProps(1)} />
          <Tab label="數據" {...a11yProps(2)} />
          <Tab label="貨品" {...a11yProps(3)} />
          <Tab label="設定" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <TransactionHistory records={records} itemNameGetter={getItemName} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TransactionCreator itemsDict={items} supabaseClient={supabase} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        To be completed
      </TabPanel>
    </div>
  );
}

export default App;
