const entryMap = {
  "rawdom": {
    index: "rawdom",
    elements: ""
  },
  "zro-router": {
    index: "zro-router"
  },
  "litedom": {
    core: "litedom",
    parse: ""
  },
  "comp-base": {
    core: "comp-base"
  },
  "build": {
    "plugin": "build"
  }
};
const entries = [];
const exportedEntries = [];
function flatternEntry(entry, path = "") {
  path = path === "" ? "" : path + "/";
  for (const name in entry) {
    const subEntry = entry[name];
    if (typeof subEntry === "string") {
      entries.push(path + name);
      exportedEntries.push(subEntry === "" ? path + name : subEntry);
    } else if (Array.isArray(subEntry))
      subEntry.forEach((postfix) => {
        entries.push(path + name + "." + postfix);
        exportedEntries.push(path + name + "." + postfix);
      });
    else flatternEntry(subEntry, path + name);
  }
}
flatternEntry(entryMap);
const fullEntries = entries.map((entry) => `src/${entry}.ts`);
export {
  entries,
  exportedEntries,
  fullEntries
};
