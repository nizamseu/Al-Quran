// Quick test for mushaf pages functionality
const { getMushafPage, getTotalPages } = require("./utils/mushafPages");

console.log("Testing getMushafPage function...");
console.log("Total pages:", getTotalPages());

// Test a few pages
for (let i = 1; i <= 5; i++) {
  const result = getMushafPage(i);
  console.log(
    `Page ${i}:`,
    result ? "Found" : "Not found",
    result ? Object.keys(result) : ""
  );
}

// Test an invalid page
const invalidResult = getMushafPage(700);
console.log("Page 700 (invalid):", invalidResult);
