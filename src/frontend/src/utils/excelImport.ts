import { Gender } from '../backend';

interface ParsedVoter {
  name: string;
  fatherHusbandName: string;
  houseNumber: bigint;
  voterId: bigint;
  address: string;
  gender: Gender;
  area: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  mobileNo: string;
  dob: string;
  caste: string;
  education: string;
  profession: string;
  office: string;
  politicalIdeology: string;
  comments: string;
  photo: null;
  signature: null;
  educationalDocuments: [];
}

export async function parseExcelFile(file: File): Promise<ParsedVoter[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error('File is empty'));
          return;
        }

        // Parse CSV content
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          reject(new Error('File must contain headers and at least one data row'));
          return;
        }

        // Parse CSV line (handle quoted fields)
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        // Parse headers
        const headers = parseCSVLine(lines[0]);
        const parsedVoters: ParsedVoter[] = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          
          // Create object from headers and values
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Validate required fields
          if (!row['Name'] || !row['Mobile'] || !row['Voter ID']) {
            continue; // Skip rows with missing required fields
          }

          // Parse gender
          let gender: Gender = Gender.other;
          const genderStr = (row['Gender'] || '').toLowerCase();
          if (genderStr === 'male') gender = Gender.male;
          else if (genderStr === 'female') gender = Gender.female;

          // Parse numeric fields safely
          const parseNumber = (value: string): bigint => {
            const num = value.replace(/[^0-9]/g, '');
            return num ? BigInt(num) : BigInt(0);
          };

          const voter: ParsedVoter = {
            name: String(row['Name'] || ''),
            fatherHusbandName: String(row['Father/Husband Name'] || ''),
            houseNumber: parseNumber(row['House Number'] || '0'),
            voterId: parseNumber(row['Voter ID'] || '0'),
            address: String(row['Address'] || ''),
            gender,
            area: String(row['Area'] || ''),
            taluka: String(row['Taluka'] || ''),
            district: String(row['District'] || ''),
            state: String(row['State'] || ''),
            pincode: String(row['Pincode'] || ''),
            mobileNo: String(row['Mobile'] || ''),
            dob: String(row['Date of Birth'] || ''),
            caste: String(row['Caste'] || ''),
            education: String(row['Education'] || ''),
            profession: String(row['Profession'] || ''),
            office: String(row['Office'] || ''),
            politicalIdeology: String(row['Political Ideology'] || ''),
            comments: String(row['Comments'] || '').slice(0, 500),
            photo: null,
            signature: null,
            educationalDocuments: [],
          };

          parsedVoters.push(voter);
        }

        resolve(parsedVoters);
      } catch (error: any) {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
