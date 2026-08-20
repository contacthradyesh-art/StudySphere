export interface StateInfo {
  /** Must exactly match the `properties.name` value in public/data/india-states.geojson */
  name: string;
  capital: string;
  type: 'state' | 'union-territory';
  /** Names of directly bordering Indian states/UTs (land borders only). */
  neighbors: string[];
}

export const INDIA_STATES: StateInfo[] = [
  { name: 'Andaman and Nicobar Islands', capital: 'Port Blair', type: 'union-territory', neighbors: [] },
  { name: 'Andhra Pradesh', capital: 'Amaravati', type: 'state', neighbors: ['Telangana', 'Chhattisgarh', 'Odisha', 'Tamil Nadu', 'Karnataka'] },
  { name: 'Arunachal Pradesh', capital: 'Itanagar', type: 'state', neighbors: ['Assam', 'Nagaland'] },
  { name: 'Assam', capital: 'Dispur', type: 'state', neighbors: ['Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya', 'West Bengal'] },
  { name: 'Bihar', capital: 'Patna', type: 'state', neighbors: ['Uttar Pradesh', 'Jharkhand', 'West Bengal'] },
  { name: 'Chandigarh', capital: 'Chandigarh', type: 'union-territory', neighbors: ['Punjab', 'Haryana'] },
  { name: 'Chhattisgarh', capital: 'Raipur', type: 'state', neighbors: ['Madhya Pradesh', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Odisha', 'Jharkhand', 'Uttar Pradesh'] },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', capital: 'Daman', type: 'union-territory', neighbors: ['Gujarat', 'Maharashtra'] },
  { name: 'Delhi', capital: 'New Delhi', type: 'union-territory', neighbors: ['Haryana', 'Uttar Pradesh'] },
  { name: 'Goa', capital: 'Panaji', type: 'state', neighbors: ['Maharashtra', 'Karnataka'] },
  { name: 'Gujarat', capital: 'Gandhinagar', type: 'state', neighbors: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Dadra and Nagar Haveli and Daman and Diu'] },
  { name: 'Haryana', capital: 'Chandigarh', type: 'state', neighbors: ['Punjab', 'Himachal Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Delhi', 'Chandigarh'] },
  { name: 'Himachal Pradesh', capital: 'Shimla', type: 'state', neighbors: ['Jammu and Kashmir', 'Ladakh', 'Punjab', 'Haryana', 'Uttarakhand'] },
  { name: 'Jammu and Kashmir', capital: 'Srinagar', type: 'union-territory', neighbors: ['Ladakh', 'Himachal Pradesh', 'Punjab'] },
  { name: 'Jharkhand', capital: 'Ranchi', type: 'state', neighbors: ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh', 'Uttar Pradesh'] },
  { name: 'Karnataka', capital: 'Bengaluru', type: 'state', neighbors: ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'] },
  { name: 'Kerala', capital: 'Thiruvananthapuram', type: 'state', neighbors: ['Karnataka', 'Tamil Nadu'] },
  { name: 'Ladakh', capital: 'Leh', type: 'union-territory', neighbors: ['Jammu and Kashmir', 'Himachal Pradesh'] },
  { name: 'Lakshadweep', capital: 'Kavaratti', type: 'union-territory', neighbors: [] },
  { name: 'Madhya Pradesh', capital: 'Bhopal', type: 'state', neighbors: ['Uttar Pradesh', 'Chhattisgarh', 'Maharashtra', 'Gujarat', 'Rajasthan'] },
  { name: 'Maharashtra', capital: 'Mumbai', type: 'state', neighbors: ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana', 'Karnataka', 'Goa', 'Dadra and Nagar Haveli and Daman and Diu'] },
  { name: 'Manipur', capital: 'Imphal', type: 'state', neighbors: ['Nagaland', 'Mizoram', 'Assam'] },
  { name: 'Meghalaya', capital: 'Shillong', type: 'state', neighbors: ['Assam'] },
  { name: 'Mizoram', capital: 'Aizawl', type: 'state', neighbors: ['Assam', 'Manipur', 'Tripura'] },
  { name: 'Nagaland', capital: 'Kohima', type: 'state', neighbors: ['Assam', 'Manipur', 'Arunachal Pradesh'] },
  { name: 'Odisha', capital: 'Bhubaneswar', type: 'state', neighbors: ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'] },
  { name: 'Puducherry', capital: 'Puducherry', type: 'union-territory', neighbors: ['Tamil Nadu'] },
  { name: 'Punjab', capital: 'Chandigarh', type: 'state', neighbors: ['Jammu and Kashmir', 'Himachal Pradesh', 'Haryana', 'Rajasthan', 'Chandigarh'] },
  { name: 'Rajasthan', capital: 'Jaipur', type: 'state', neighbors: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'] },
  { name: 'Sikkim', capital: 'Gangtok', type: 'state', neighbors: ['West Bengal'] },
  { name: 'Tamil Nadu', capital: 'Chennai', type: 'state', neighbors: ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Puducherry'] },
  { name: 'Telangana', capital: 'Hyderabad', type: 'state', neighbors: ['Maharashtra', 'Chhattisgarh', 'Andhra Pradesh', 'Karnataka'] },
  { name: 'Tripura', capital: 'Agartala', type: 'state', neighbors: ['Assam', 'Mizoram'] },
  { name: 'Uttar Pradesh', capital: 'Lucknow', type: 'state', neighbors: ['Uttarakhand', 'Haryana', 'Delhi', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Bihar'] },
  { name: 'Uttarakhand', capital: 'Dehradun', type: 'state', neighbors: ['Himachal Pradesh', 'Uttar Pradesh'] },
  { name: 'West Bengal', capital: 'Kolkata', type: 'state', neighbors: ['Odisha', 'Jharkhand', 'Bihar', 'Sikkim', 'Assam'] }
];
