
interface ForecastData {
  Week: string;
  "Total IB Units": number;
  exceptions: number;
  inventory: number;
  returns: number;
  wfs_china: number;
}

interface ForecastResponse {
  dz_df: ForecastData[];
  // There might be other keys in the response, but we're only using dz_df
}

export async function fetchForecastData(file: File, forecastPeriod: number): Promise<ForecastData[]> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('forecast_period', forecastPeriod.toString());
    
    const response = await fetch('https://f791-2409-40f4-1011-194f-19ee-f25d-8b8c-66bb.ngrok-free.app/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data: ForecastResponse = await response.json();
    return data.dz_df;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    // Return empty array in case of error
    return [];
  }
}

// Function to map API data to our format
export function mapForecastData(apiData: ForecastData[]) {
  return apiData.map(item => ({
    date: item.Week,
    dateFormatted: `Week ${item.Week.split('-W')[1]}`,
    ibUnits: item["Total IB Units"],
    ibExceptions: item.exceptions,
    inventory: item.inventory,
    customerReturns: item.returns,
    wsfChina: item.wfs_china
  }));
}

// For generating sample data when no API data is available
export function generateWeeklyMonthlyData(weeks = 30) {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  for (let i = 0; i < weeks; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (i * 7));
    
    // Calculate week number
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    const weekKey = `${currentDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    
    const baseIbUnits = 120 + Math.random() * 80;
    const baseInventory = 100 + Math.random() * 50;
    const baseCustomerReturns = 30 + Math.random() * 30;
    const baseWsfChina = 40 + Math.random() * 40;
    const baseIbExceptions = 15 + Math.random() * 20;
    
    data.push({
      date: weekKey,
      dateFormatted: `Week ${weekNum}`,
      ibUnits: Math.round(baseIbUnits),
      inventory: Math.round(baseInventory),
      customerReturns: Math.round(baseCustomerReturns),
      wsfChina: Math.round(baseWsfChina),
      ibExceptions: Math.round(baseIbExceptions),
    });
  }
  
  return data;
}

// For aggregating by month
export function aggregateToMonthly(data: any[]) {
  const groupedData: { [key: string]: any } = {};
  
  data.forEach(item => {
    const date = new Date(parseInt(item.date.split('-')[0]), 0, 1);
    date.setDate(date.getDate() + (parseInt(item.date.split('-W')[1]) - 1) * 7);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!groupedData[key]) {
      groupedData[key] = {
        count: 0,
        ibUnits: 0,
        inventory: 0,
        customerReturns: 0,
        wsfChina: 0,
        ibExceptions: 0
      };
    }
    
    const group = groupedData[key];
    group.count += 1;
    group.ibUnits += item.ibUnits;
    group.inventory += item.inventory;
    group.customerReturns += item.customerReturns;
    group.wsfChina += item.wsfChina;
    group.ibExceptions += item.ibExceptions;
  });
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return Object.entries(groupedData).map(([key, value]) => {
    const month = parseInt(key.split('-')[1]) - 1;
    const year = key.split('-')[0];
    const dateFormatted = `${monthNames[month]} ${year}`;
    
    const countValue = (value as any).count;
    
    return {
      date: key,
      dateFormatted,
      ibUnits: Math.round((value as any).ibUnits / countValue),
      inventory: Math.round((value as any).inventory / countValue),
      customerReturns: Math.round((value as any).customerReturns / countValue),
      wsfChina: Math.round((value as any).wsfChina / countValue),
      ibExceptions: Math.round((value as any).ibExceptions / countValue),
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}
