const entryMap = {
  "dom-base": {
    index: ""
  }
};
const entries = [];
function flatternEntry(entry, path = "") {
  path = path === "" ? "" : path + "/";
  for (const name in entry) {
    const subEntry = entry[name];
    if (subEntry === "") entries.push(path + name);
    else if (Array.isArray(subEntry))
      subEntry.forEach((postfix) => entries.push(path + name + "." + postfix));
    else flatternEntry(subEntry, path + name);
  }
}
flatternEntry(entryMap);
const entriesFull = entries.map((entry) => `src/${entry}.ts`);
const entriesFullSet = new Set(entriesFull);
export {
  entries,
  entriesFull,
  entriesFullSet
};
