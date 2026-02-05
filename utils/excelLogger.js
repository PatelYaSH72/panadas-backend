import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const filePath = path.join("logs", "tools-log.xlsx");

export const logToolToExcel = (tool) => {
  // Folder ensure
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }

  let workbook;
  let worksheet;
  let data = [];

  // Agar file already exist karti hai
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets["Tools"];
    data = XLSX.utils.sheet_to_json(worksheet);
  } else {
    workbook = XLSX.utils.book_new();
  }

  // New row
  data.push({
    Name: tool.name,
    Pricing: tool.pricing,
    Rating: tool.rating,
    Category: tool.category?.join(", "),
    AddedBy: tool.addedBy,
    Status: tool.isPublished,
    CreatedAt: new Date().toLocaleString(),
    WhatItDoes:tool.whatItDoes,
    Howtouse: tool.howToUse,
    TechRelevance: tool.techRelevance,
    Image:tool.image,
    OfficialLink:tool.officialLink,
    DocLink: tool.docLink,
    TutorialLink: tool.tutorialLink,
    GithubLink: tool.githubLink,
  });

  worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tools");

  XLSX.writeFile(workbook, filePath);
};
