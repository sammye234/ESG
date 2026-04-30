// client/src/pages/Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Zap, TrendingUp, Trash2,
  Users, Shield, Leaf, AlertCircle,
  BookOpen, Heart, TreePine, Activity, X,
  FileText, ClipboardList, UserCheck, BarChart2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

import { useAuth } from '../hooks/useAuth';
import { Header, SidebarMenu } from '../components/common';
import { MaterialCalculatorWidget } from '../components/widgets';

// ─── DEMO DATA ───────────────────────────────────────────────────────────────

const SBUS = ['ALL', 'HO', 'GTL', '4AL', 'BFL'];
const BU_DISPLAY_LABELS = {
  '4AL': '4AYDL',
};
const BU_NORMALIZE = {
  '4AYDL': '4AL',
  'GTL':   'GTL',
  'HO':    'HO',
  'BFL':   'BFL',
};
const BU_LOGOS = {
  '4AL': '/logos/4al.png',
};

const DIVISION_LABELS = {
  DEFAULT: ['Knitting','Dyeing','Finishing','QC','Admin','Cutting','Sewing','Packing'],
  '4AL':   ['Barishal','Chittagong','Dhaka','Khulna','Mymensingh','Rajshahi','Sylhet','Rangpur'],
};
const demoData = {
  HO:  { male:120, female:210, mgmtM:18, mgmtF:12, divs:[22,18,15,20,14,16,12,13], ages:[45,80,95,110],  disability:6,  ethnic:{Bengali:290,Chakma:22,Marma:8,Garo:10},  newHire:34,  left:12, localEmp:280  },
  GTL: { male:540, female:820, mgmtM:32, mgmtF:18, divs:[120,105,98,110,80,95,110,42], ages:[180,350,210,120], disability:18, ethnic:{Bengali:1200,Chakma:80,Marma:40,Garo:40},  newHire:120, left:55, localEmp:1150 },
  '4AL': {
    male: 2375, female: 4530,
    mgmtM: 74, mgmtF: 110,
    divs: [759, 138, 1864, 345, 759, 1450, 69, 1519],
    ages: [3961, 2499, 420, 25],
    disability: 50,
    ethnic: { Bengali: 900, Chakma: 50, Marma: 25, Garo: 15 },
    newHire: 90, left: 464, localEmp: 870
  },
  BFL: { male:460, female:740, mgmtM:28, mgmtF:16, divs:[110,100,90,105,70,88,95,42], ages:[170,300,195,105], disability:16, ethnic:{Bengali:1050,Chakma:65,Marma:35,Garo:50},  newHire:110, left:48, localEmp:1000 },
};
demoData['ALL'] = {
  male:  Object.values(demoData).reduce((s,d)=>s+d.male,0),
  female:Object.values(demoData).reduce((s,d)=>s+d.female,0),
  mgmtM: Object.values(demoData).reduce((s,d)=>s+d.mgmtM,0),
  mgmtF: Object.values(demoData).reduce((s,d)=>s+d.mgmtF,0),
  divs:[342,308,278,323,224,271,297,137],
  ages:[535,990,670,425],
  disability:54,
  ethnic:{Bengali:3440,Chakma:217,Marma:108,Garo:115},
  newHire:354, left:157, localEmp:3300,
};

const headcountYearly = [
  {year:'2021',total:2800},{year:'2022',total:3100},
  {year:'2023',total:3400},{year:'2024',total:3600},{year:'2025',total:3880},
];

const trainingAccess   = [{bu:'HO',male:95,female:180},{bu:'GTL',male:420,female:710},{bu:'4AL',male:310,female:540},{bu:'BFL',male:390,female:660}];
const trainingHours    = [{bu:'HO',male:320,female:580},{bu:'GTL',male:1240,female:2100},{bu:'4AL',male:920,female:1650},{bu:'BFL',male:1100,female:1900}];
const trainingSkills   = [{skill:'Soft Skills',count:14820},{skill:'Hard Skills',count:12167}];
const trainingCategory = [
  {cat:'Compliance & Audit',count:5796},{cat:'OHS',count:4902},
  {cat:'Worker Welfare',count:4276},{cat:'Orientation',count:3110},
  {cat:'Fire & Safety',count:3187},{cat:'Human Rights',count:1980},
  {cat:'Environment',count:1909},{cat:'Grievance',count:1827},
];

const wellbeingChecks = [
  {label:'Daycare available',            HO:false, GTL:true,  '4AL':true,  BFL:true },
  {label:'Breastfeeding corner',         HO:false, GTL:true,  '4AL':true,  BFL:true },
  {label:'Nutritious food (pregnant)',   HO:false,GTL:true,  '4AL':true,  BFL:true },
  {label:'Free medicine/multivitamins',  HO:false, GTL:true,  '4AL':true,  BFL:true },
  {label:'Telemedicine access',          HO:false, GTL:true,  '4AL':false, BFL:true },
  {label:'Free Friday clinic',           HO:false,GTL:true,  '4AL':true,  BFL:true },
  {label:'Sanitary napkin disposer',     HO:false, GTL:true,  '4AL':true,  BFL:true },
  {label:'Free health screening (M&F)',  HO:false, GTL:true,  '4AL':true,  BFL:true },
  {label:'Free breast cancer screening', HO:false,GTL:true,  '4AL':false, BFL:true },
  {label:'Fair-price shop',              HO:false, GTL:true,  '4AL':true,  BFL:false},
  {label:'Indoor Env Quality 100%',      HO:false, GTL:false, '4AL':true,  BFL:true },
];

const csrData = {
  treePlanting:{target:6000000,planted:1500000},
  education:{scholarships:320,womenHigher:85,totalBenef:920,stipends:240},
  budget:20000000,
  spending:[
    {name:'Tree Plantation',pct:35},{name:'Education',pct:20},
    {name:'Health',pct:18},{name:'Community',pct:15},{name:'Others',pct:12},
  ],
};

const ohsYearly = [
  {year:'2021',cases:28},{year:'2022',cases:22},
  {year:'2023',cases:18},{year:'2024',cases:14},{year:'2025',cases:9},
];

const esiData = {
  HO:   [3.8,3.5,3.2,3.6,3.9,3.7,3.4,3.6],
  GTL:  [4.0,3.8,3.5,3.7,4.1,3.9,3.6,3.8],
  '4AL':[3.7,3.4,3.0,3.4,3.8,3.6,3.3,3.5],
  BFL:  [3.9,3.7,3.4,3.6,4.0,3.8,3.5,3.7],
};
const ESI_DIMS = ['Safety','Growth','Salary','Benefits','Work Env','Management','W-L Balance','Overall'];

const wageData = [
  {grade:'G1',salary:8500, ot:10200,total:12500},{grade:'G2',salary:9500, ot:11400,total:14000},
  {grade:'G3',salary:11000,ot:13200,total:16200},{grade:'G4',salary:13500,ot:16200,total:19800},
  {grade:'G5',salary:16000,ot:19200,total:23500},{grade:'G6',salary:20000,ot:24000,total:29000},
  {grade:'G7',salary:26000,ot:31200,total:38000},
];

const pipelineData = {fresher:320,helper:510,skilled:2180};

const ohsGov = [
  {type:'Cut / Laceration',cases:4,action:1},{type:'Chemical Splash',cases:2,action:1},
  {type:'Slip / Trip / Fall',cases:3,action:1},{type:'Eye Irritation',cases:2,action:0},
  {type:'Heat Exhaustion',cases:1,action:1},
];

const absenteeism = [3.1,2.8,2.5,3.0,2.6,2.3,2.1,2.4,2.2,2.0,1.9,2.1];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const policyData = {sessions:48,hours:312,maleAtt:1240,femaleAtt:1980};
const policies = [
  {name:'Health & Safety Policy',    cat:'Safety',       date:'Jan 2024', trained:'Yes', sessions:6},
  {name:'Anti-Harassment Policy',    cat:'HR',           date:'Mar 2024', trained:'Yes', sessions:8},
  {name:'Environmental Management',  cat:'Environment',  date:'Feb 2024', trained:'Yes', sessions:4},
  {name:'Code of Conduct',           cat:'Ethics',       date:'Jan 2024', trained:'Yes', sessions:10},
  {name:'Whistleblowing Policy',     cat:'Ethics',       date:'Apr 2024', trained:'No',  sessions:0},
  {name:'Child Labor Prevention',    cat:'Labor',        date:'Jan 2024', trained:'Yes', sessions:5},
];

// ─── SMALL REUSABLE COMPONENTS ───────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}}>{p.name}: {Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

const SectionHeading = ({ icon: Icon, label, color = 'emerald' }) => {
  const colors = {
    emerald: 'text-emerald-700 border-emerald-500 bg-emerald-50',
    blue:    'text-blue-700 border-blue-500 bg-blue-50',
    purple:  'text-purple-700 border-purple-500 bg-purple-50',
    orange:  'text-orange-700 border-orange-500 bg-orange-50',
    red:     'text-red-700 border-red-500 bg-red-50',
    cyan:    'text-cyan-700 border-cyan-500 bg-cyan-50',
    teal:    'text-teal-700 border-teal-500 bg-teal-50',
    rose:    'text-rose-700 border-rose-500 bg-rose-50',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-l-4 mb-5 mt-8 ${colors[color]}`}>
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span className="font-bold text-base tracking-tight">{label}</span>
    </div>
  );
};

const ChartCard = ({ title, sub, children, borderColor = 'border-emerald-500' }) => (
  <div className={`bg-white rounded-xl shadow-md border border-gray-100 border-t-4 ${borderColor} p-5`}>
    {title && <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{title}</p>}
    {sub && <p className="text-sm text-gray-500 mb-4">{sub}</p>}
    {children}
  </div>
);

const StatCard = ({ label, value, unit='', sub='', color='emerald' }) => {
  const border = {
    emerald:'border-l-emerald-500', blue:'border-l-blue-500', purple:'border-l-purple-500',
    orange:'border-l-orange-500', red:'border-l-red-500', cyan:'border-l-cyan-500',
    teal:'border-l-teal-500', rose:'border-l-rose-500', yellow:'border-l-yellow-500',
  };
  const text = {
    emerald:'text-emerald-600', blue:'text-blue-600', purple:'text-purple-600',
    orange:'text-orange-600', red:'text-red-600', cyan:'text-cyan-600',
    teal:'text-teal-600', rose:'text-rose-600', yellow:'text-yellow-600',
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${border[color]} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className={`text-sm font-semibold ml-1 ${text[color]}`}>{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

const SBUFilter = ({ active, onChange }) => (
  <div className="flex items-center gap-4 mb-6 flex-wrap">
    <div className="flex gap-2 flex-wrap">
      {SBUS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
            active === s
              ? 'bg-gray-900 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {BU_DISPLAY_LABELS[s] || s}
        </button>
      ))}
    </div>
    {BU_LOGOS[active] && (
      <img
        src={BU_LOGOS[active]}
        alt={`${active} logo`}
        className="h-10 object-contain ml-auto"
      />
    )}
  </div>
);

// ─── ENVIRONMENTAL VIEW ───────────────────────────────────────────────────────

const EnvModuleCard = ({ icon: Icon, label, desc, color, onClick }) => {
  const configs = {
    blue:   { bg:'bg-blue-50',   border:'border-blue-200',  icon:'text-blue-600',   btn:'bg-blue-600 hover:bg-blue-700'   },
    emerald:{ bg:'bg-emerald-50',border:'border-emerald-200',icon:'text-emerald-600',btn:'bg-emerald-600 hover:bg-emerald-700'},
    orange: { bg:'bg-orange-50', border:'border-orange-200', icon:'text-orange-600', btn:'bg-orange-600 hover:bg-orange-700' },
    red:    { bg:'bg-red-50',    border:'border-red-200',    icon:'text-red-600',    btn:'bg-red-600 hover:bg-red-700'     },
  };
  const c = configs[color];
  return (
    <button
      onClick={onClick}
      className={`${c.bg} ${c.border} border-2 rounded-2xl p-6 flex flex-col items-center gap-4 text-center
        hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group`}
    >
      <div className={`w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center
        group-hover:shadow-lg transition-shadow`}>
        <Icon className={`w-8 h-8 ${c.icon}`} />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-base">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      <span className={`${c.btn} text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors`}>
        Open Dashboard →
      </span>
    </button>
  );
};

const EnvironmentalView = ({ onNavigate }) => (
  <div>
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-5 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Leaf className="w-5 h-5 text-emerald-600" />
        <p className="font-bold text-emerald-800">Environmental Modules</p>
      </div>
      <p className="text-sm text-emerald-700">
        Select a module below to open its dedicated dashboard with full data visualizations and upload functionality.
      </p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <EnvModuleCard
        icon={Droplets}
        label="Water Dashboard"
        desc="Consumption, Sankey flow, recycling rates"
        color="blue"
        onClick={() => onNavigate('water-dashboard')}
      />
      <EnvModuleCard
        icon={Zap}
        label="Energy Dashboard"
        desc="Scope 1 & 2, intensity, solar vs diesel"
        color="orange"
        onClick={() => onNavigate('energy-dashboard')}
      />
      <EnvModuleCard
        icon={TrendingUp}
        label="Emissions Dashboard"
        desc="GHG scopes, intensity chart, KPI cards"
        color="red"
        onClick={() => onNavigate('emissions-dashboard')}
      />
      <EnvModuleCard
        icon={Trash2}
        label="Waste Dashboard"
        desc="Recycling breakdown, Sankey, trend charts"
        color="emerald"
        onClick={() => onNavigate('waste-dashboard')}
      />
    </div>
  </div>
);

// ─── SOCIAL VIEW ─────────────────────────────────────────────────────────────

const SocialView = ({user}) => {
  
  const isBUUser = ['bu_manager', 'bu_user'].includes(user?.role);
  const userBU = BU_NORMALIZE[user?.businessUnit] || user?.businessUnit;
  const [sbu, setSbu] = useState(isBUUser ? (userBU || 'ALL') : 'ALL');
  const visibleSBUS = isBUUser ? [userBU] : SBUS;
  //const [sbu, setSbu] = useState('ALL');
  const d = demoData[sbu];
  const total = d.male + d.female;

  const genderPie   = [{name:'Male',value:d.male},{name:'Female',value:d.female}];
  const mgmtDonut   = [{name:'Male',value:d.mgmtM},{name:'Female',value:d.mgmtF}];
  const divLabels = DIVISION_LABELS[sbu] || DIVISION_LABELS.DEFAULT;
  const divBar = divLabels.map((l, i) => ({ div: l, count: d.divs[i] }));
  const ageBar      = [{group:'18–25',count:d.ages[0]},{group:'26–35',count:d.ages[1]},{group:'36–45',count:d.ages[2]},{group:'46+',count:d.ages[3]}];
  const ethnicBar   = Object.entries(d.ethnic).map(([k,v])=>({group:k,count:v}));
  const BU_COLORS   = {HO:'#2563eb',GTL:'#059669','4AL':'#e11d74',BFL:'#f59e0b'};
  const buList      = sbu==='ALL'?['HO','GTL','4AL','BFL']:[sbu];
  const radarData   = ESI_DIMS.map((label,i)=>{const e={dimension:label};buList.forEach(b=>{e[b]=esiData[b][i];});return e;});
  
  const csrSpend    = csrData.spending.map(s=>({name:s.name,amount:Math.round(csrData.budget*s.pct/100)}));
  const plantedPct  = Math.round((csrData.treePlanting.planted/csrData.treePlanting.target)*100);

  return (
    <div>
      {!isBUUser && <SBUFilter active={sbu} onChange={setSbu} />}
      {isBUUser && (
        <div className="flex items-center gap-4 mb-6">
          <span className="px-5 py-2 rounded-xl font-semibold text-sm bg-gray-900 text-white">
            {BU_DISPLAY_LABELS[sbu] || sbu}
          </span>
          {BU_LOGOS[sbu] && (
            <img src={BU_LOGOS[sbu]} alt="BU Logo" className="h-16 object-contain" />
          )}
        </div>
      )}

      {/* a. DEI */}
      <SectionHeading icon={Users} label="a. Diversity, Equity & Inclusion" color="blue" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Workforce"    value={total}        color="blue"   sub={`${sbu}`} />
        <StatCard label="Local Community"    value={d.localEmp}   color="emerald"/>
        <StatCard label="Disability Inclusion" value={d.disability} color="purple" sub={`${((d.disability/total)*100).toFixed(1)}% of workforce`}/>
        <StatCard label="New Hires This Year" value={d.newHire}   color="orange" sub={`${d.left} left • Net: +${d.newHire-d.left}`}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Gender Diversity" sub="Male vs Female ratio" borderColor="border-t-blue-500">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderPie} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                label={({name,value,percent})=>`${name}: ${value.toLocaleString()} (${(percent*100).toFixed(0)}%)`}>
                <Cell fill="#2563eb"/><Cell fill="#e11d74"/>
              </Pie>
              <Tooltip formatter={v=>v.toLocaleString()}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender in Leadership" sub="Management & Supervisory roles — donut chart" borderColor="border-t-pink-500">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mgmtDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                <Cell fill="#2563eb"/><Cell fill="#e11d74"/>
              </Pie>
              <Legend/><Tooltip formatter={v=>v.toLocaleString()}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Workforce Representation" sub="Employees per division (8 divisions)" borderColor="border-t-cyan-500">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={divBar} layout="vertical" margin={{left:10,right:36}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis type="category" dataKey="div" tick={{fontSize:11}} width={68}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Employees" fill="#0891b2" radius={[0,4,4,0]}
                label={{position:'right',fontSize:11,fill:'#0891b2'}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Diversity" sub="Employees by age group" borderColor="border-t-purple-500">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageBar} layout="vertical" margin={{left:10,right:36}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis type="category" dataKey="group" tick={{fontSize:11}} width={52}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Employees" fill="#7c3aed" radius={[0,4,4,0]}
                label={{position:'right',fontSize:11,fill:'#7c3aed'}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Employment Generation" sub="Total headcount growth — yearly" borderColor="border-t-emerald-500">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={headcountYearly} margin={{right:24,top:10}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="year" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="total" name="Headcount" stroke="#059669" strokeWidth={2.5}
                dot={{r:5,fill:'#059669'}}
                label={{position:'top',fontSize:11,fill:'#059669',formatter:v=>v.toLocaleString()}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ethnicity Distribution" sub={`Ethnic groups — ${sbu}`} borderColor="border-t-yellow-500">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ethnicBar} layout="vertical" margin={{left:10,right:36}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis type="category" dataKey="group" tick={{fontSize:11}} width={65}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Count" fill="#d97706" radius={[0,4,4,0]}
                label={{position:'right',fontSize:11,fill:'#d97706'}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* b. Training */}
      <SectionHeading icon={BookOpen} label="b. Training & Development" color="emerald" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Training Access" sub="Employees trained — Male vs Female per BU" borderColor="border-t-blue-500">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trainingAccess}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="bu" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              <Bar dataKey="male" name="Male" fill="#2563eb" radius={[4,4,0,0]}/>
              <Bar dataKey="female" name="Female" fill="#e11d74" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Training Volume" sub="Total training hours — Male vs Female per BU" borderColor="border-t-pink-500">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trainingHours}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="bu" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend/>
              <Bar dataKey="male" name="Male Hrs" fill="#2563eb" radius={[4,4,0,0]}/>
              <Bar dataKey="female" name="Female Hrs" fill="#e11d74" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Skills Development" sub="Soft skills vs Hard skills trained" borderColor="border-t-emerald-500">
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={trainingSkills} layout="vertical" margin={{left:10,right:48}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11}}/>
              <YAxis type="category" dataKey="skill" tick={{fontSize:12}} width={90}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Count" fill="#059669" radius={[0,6,6,0]}
                label={{position:'right',fontSize:12,fill:'#059669',formatter:v=>v.toLocaleString()}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Training Coverage" sub="Sessions by category (all BUs)" borderColor="border-t-purple-500">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trainingCategory} layout="vertical" margin={{left:10,right:44}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10}}/>
              <YAxis type="category" dataKey="cat" tick={{fontSize:10}} width={115}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="count" name="Count" fill="#7c3aed" radius={[0,4,4,0]}
                label={{position:'right',fontSize:11,fill:'#7c3aed',formatter:v=>v.toLocaleString()}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* c. Wellbeing */}
      <SectionHeading icon={Heart} label="c. Employee Wellbeing" color="purple" />

      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-purple-500 p-5 mb-5 overflow-x-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Employee Wellbeing Checklist</p>
        <p className="text-sm text-gray-500 mb-4">Facilities available per Business Unit</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2.5 text-xs font-bold uppercase text-gray-500 tracking-wide">Facility</th>
              {['HO','GTL','4AL','BFL'].map(s=>(
                <th key={s} className="text-center px-3 py-2.5 text-xs font-bold uppercase text-gray-500 tracking-wide">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wellbeingChecks.map((row,i)=>(
              <tr key={i} className={`border-t border-gray-100 ${i%2===0?'bg-white':'bg-gray-50'}`}>
                <td className="px-3 py-2.5 text-gray-700">{row.label}</td>
                {['HO','GTL','4AL','BFL'].map(s=>(
                  <td key={s} className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                      ${row[s]?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-600'}`}>
                      {row[s]?'✓':'✗'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* d. CSR */}
      <SectionHeading icon={TreePine} label="d. CSR & Community Investment" color="orange" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Scholarships"         value={csrData.education.scholarships} color="emerald" sub="Workers' children"/>
        <StatCard label="Women Higher Studies"  value={csrData.education.womenHigher}  color="rose"/>
        <StatCard label="Total Beneficiaries"   value={csrData.education.totalBenef}   color="blue"/>
        <StatCard label="Stipends Provided"     value={csrData.education.stipends}     color="yellow" sub="Women & children"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Tree Plantation Progress" sub={`Target: ${csrData.treePlanting.target.toLocaleString()} trees`} borderColor="border-t-emerald-500">
          <div className="mb-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-gray-600">Planted: <strong>{csrData.treePlanting.planted.toLocaleString()}</strong></span>
              <span className="text-sm font-bold text-emerald-600">{plantedPct}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full flex items-center justify-end pr-2"
                style={{width:`${plantedPct}%`}}>
                <span className="text-xs text-white font-bold">{plantedPct}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Remaining: {(csrData.treePlanting.target-csrData.treePlanting.planted).toLocaleString()} trees</p>
          </div>
        </ChartCard>

        <ChartCard title="CSR Spending Breakdown" sub={`Total budget: BDT ${(csrData.budget/10000000).toFixed(0)} Crore`} borderColor="border-t-orange-500">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={csrSpend} layout="vertical" margin={{left:10,right:54}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:10}} width={95}/>
              <Tooltip formatter={v=>`BDT ${v.toLocaleString()}`}/>
              <Bar dataKey="amount" name="Amount" fill="#ea580c" radius={[0,4,4,0]}
                label={{position:'right',fontSize:10,fill:'#ea580c',formatter:v=>`${(v/1000000).toFixed(1)}M`}}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* e. OHS */}
      <SectionHeading icon={Activity} label="e. Occupational Health & Safety" color="red" />

      <ChartCard title="OHS Incident Tracking" sub="First aid cases per year — all BUs" borderColor="border-t-red-500">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ohsYearly} margin={{right:24,top:10}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="year" tick={{fontSize:11}}/>
            <YAxis tick={{fontSize:11}}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line type="monotone" dataKey="cases" name="First Aid Cases" stroke="#dc2626" strokeWidth={2.5}
              dot={{r:6,fill:'#dc2626',stroke:'#fff',strokeWidth:2}}
              label={{position:'top',fontSize:12,fill:'#dc2626',dy:-6}}/>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* f. ESI */}
      <SectionHeading icon={UserCheck} label="f. Employee Satisfaction Index (ESI)" color="cyan" />

      <ChartCard title="ESI Spider Chart" sub="Scores across all 8 dimensions (scale 1–5) — per SBU" borderColor="border-t-cyan-500">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData} cx="50%" cy="50%">
            <PolarGrid/>
            <PolarAngleAxis dataKey="dimension" tick={{fontSize:12}}/>
            <PolarRadiusAxis angle={90} domain={[0,5]} tick={{fontSize:10}}/>
            {buList.map(b=>(
              <Radar key={b} name={b} dataKey={b}
                stroke={BU_COLORS[b]} fill={BU_COLORS[b]} fillOpacity={0.15} strokeWidth={2}/>
            ))}
            <Legend/><Tooltip formatter={v=>Number(v).toFixed(2)}/>
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

// ─── GOVERNANCE VIEW ──────────────────────────────────────────────────────────

const GovernanceView = ({user}) => {
  const isBUUser = ['bu_manager', 'bu_user'].includes(user?.role);
  //const userBU = user?.businessUnit;
  const userBU = BU_NORMALIZE[user?.businessUnit] || user?.businessUnit;
  const absentData = MONTHS.map((m,i)=>({month:m,rate:absenteeism[i]}));
  const absentAvg  = (absenteeism.reduce((a,v)=>a+v,0)/12).toFixed(2);
  const pipeTotal  = pipelineData.fresher+pipelineData.helper+pipelineData.skilled;

  return (

    <div>
      {isBUUser && BU_LOGOS[userBU] && (
        <div className="flex items-center gap-3 mb-6">
          <img src={BU_LOGOS[userBU]} alt="BU Logo" className="h-16 object-contain" />
          <span className="text-lg font-bold text-gray-700">
            {BU_DISPLAY_LABELS[userBU] || userBU} — Governance Report
          </span>
        </div>
      )}
      {/* a. Policy */}
      <SectionHeading icon={FileText} label="a. Policy Management" color="blue" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Sessions Held"      value={policyData.sessions} color="blue"/>
        <StatCard label="Training Hours"     value={policyData.hours}    color="teal"/>
        <StatCard label="Male Attendance"    value={policyData.maleAtt}  color="blue"/>
        <StatCard label="Female Attendance"  value={policyData.femaleAtt}color="rose"/>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-blue-500 p-5 mb-5 overflow-x-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Policy Register</p>
        <p className="text-sm text-gray-500 mb-4">List of active policies — all BUs</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {['Policy Name','Category','Published','Training','Sessions'].map(h=>(
                <th key={h} className="text-left px-3 py-2.5 text-xs font-bold uppercase text-gray-500 tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.map((p,i)=>(
              <tr key={i} className={`border-t border-gray-100 ${i%2===0?'bg-white':'bg-gray-50'}`}>
                <td className="px-3 py-2.5 font-semibold text-gray-800">{p.name}</td>
                <td className="px-3 py-2.5">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{p.cat}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-500">{p.date}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${p.trained==='Yes'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-600'}`}>
                    {p.trained}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-gray-700">{p.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* b. Wage */}
      <SectionHeading icon={ClipboardList} label="b. Labor Law & Wage Compliance" color="teal" />

      <ChartCard title="Grade-wise Minimum Wage" sub="Salary / Salary+OT / Salary+OT+Benefits (BDT)" borderColor="border-t-teal-500">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={wageData} margin={{left:10,right:10}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="grade" tick={{fontSize:11}}/>
            <YAxis tick={{fontSize:11}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>`BDT ${v.toLocaleString()}`}/>
            <Legend/>
            <Bar dataKey="salary" name="Base Salary"        fill="#0f766e" stackId="a"/>
            <Bar dataKey="ot"     name="+ Overtime"         fill="#0d9488" stackId="b"/>
            <Bar dataKey="total"  name="+ Non-wage Benefits"fill="#2dd4bf" stackId="c" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* c. Pipeline */}
      <SectionHeading icon={BarChart2} label="c. Workforce Pipeline & Training Governance" color="purple" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Workforce Pipeline" sub="Workers per stage: Fresher → Helper → Skilled" borderColor="border-t-purple-500">
          <div className="py-2 space-y-4">
            {[
              {label:'Fresher',       count:pipelineData.fresher, col:'#7c3aed'},
              {label:'Helper',        count:pipelineData.helper,  col:'#6d28d9'},
              {label:'Skilled Operator',count:pipelineData.skilled,col:'#5b21b6'},
            ].map((s,i)=>(
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                  <span className="text-sm font-bold" style={{color:s.col}}>{s.count.toLocaleString()}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-5 overflow-hidden">
                  <div className="h-full rounded-full flex items-center pl-2.5"
                    style={{width:`${Math.round((s.count/pipelineData.skilled)*100)}%`,background:s.col,minWidth:50}}>
                    <span className="text-xs text-white font-bold">{((s.count/pipeTotal)*100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 flex gap-6 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Fresher → Skilled</p>
                <p className="text-2xl font-extrabold text-purple-700">145</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Helper → Skilled</p>
                <p className="text-2xl font-extrabold text-purple-700">280</p>
              </div>
              <div className="ml-auto">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">In-house Sessions</p>
                <p className="text-2xl font-extrabold text-emerald-600">187</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="OHS Compliance" sub="Incidents recorded & action taken (Yes / No)" borderColor="border-t-yellow-500">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-yellow-50">
                {['Incident Type','Cases','Action Taken'].map(h=>(
                  <th key={h} className="text-left px-3 py-2 text-xs font-bold uppercase text-yellow-700 tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ohsGov.map((r,i)=>(
                <tr key={i} className="border-t border-yellow-100">
                  <td className="px-3 py-2.5 text-gray-700">{r.type}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-amber-800">{r.cases}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${r.action?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-600'}`}>
                      {r.action?'Yes':'No'}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-yellow-300 bg-yellow-50">
                <td colSpan={2} className="px-3 py-2 text-xs font-bold text-yellow-800 uppercase tracking-wide">Compliance Rate</td>
                <td className="px-3 py-2 font-extrabold text-emerald-600 text-lg">
                  {Math.round((ohsGov.filter(r=>r.action).length/ohsGov.length)*100)}%
                </td>
              </tr>
            </tbody>
          </table>
        </ChartCard>
      </div>

      {/* e. Absenteeism */}
      <SectionHeading icon={Activity} label="e. Absenteeism Rate" color="rose" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        <StatCard label="Dec Absenteeism" value={`${absenteeism[11]}%`} color="rose"
          sub={`Avg 2025: ${absentAvg}% — ↓ improving`}/>
        <div className="lg:col-span-3">
          <ChartCard title="Monthly Absenteeism Rate" sub="Monthly % — 2025 with average reference line" borderColor="border-t-rose-500">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={absentData} margin={{left:0,right:24,top:10}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month" tick={{fontSize:11}}/>
                <YAxis domain={[0,5]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
                <Tooltip formatter={v=>`${v}%`}/>
                <ReferenceLine y={parseFloat(absentAvg)} stroke="#f59e0b" strokeDasharray="4 4"
                  label={{value:`Avg ${absentAvg}%`,position:'right',fontSize:10,fill:'#f59e0b'}}/>
                <Line type="monotone" dataKey="rate" name="Absenteeism %" stroke="#be123c" strokeWidth={2.5}
                  dot={{r:4,fill:'#be123c',stroke:'#fff',strokeWidth:2}}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, logout } = useAuth();
  const userBULogo = BU_LOGOS[user?.businessUnit];
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('environmental');
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);

  const handleNavigate = (route) => {
    setShowSidebar(false);
    const routeMap = {
      'dashboard':           '/dashboard',
      'files':               '/files',
      'kpi-calculator':      '/kpi-calculator',
      'water-dashboard':     '/water-dashboard',
      'energy-dashboard':    '/energy-dashboard',
      'emissions-dashboard': '/emissions-dashboard',
      'waste-dashboard':     '/waste-dashboard',
    };
    const path = routeMap[route];
    if (path) navigate(path);
  };

  if (!user?.isActive || user?.role === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6"/>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your account is waiting for admin approval. You'll get access once it's approved.
          </p>
          <button onClick={logout} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key:'environmental', label:'Environmental', icon:Leaf,   color:'emerald' },
    { key:'social',        label:'Social',        icon:Users,  color:'blue'    },
    { key:'governance',    label:'Governance',    icon:Shield, color:'purple'  },
  ];

  const tabColors = {
    environmental:{ active:'bg-emerald-600 text-white shadow-lg shadow-emerald-200', hover:'hover:bg-emerald-50 hover:text-emerald-700' },
    social:       { active:'bg-blue-600 text-white shadow-lg shadow-blue-200',    hover:'hover:bg-blue-50 hover:text-blue-700'    },
    governance:   { active:'bg-purple-600 text-white shadow-lg shadow-purple-200', hover:'hover:bg-purple-50 hover:text-purple-700' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <SidebarMenu
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNavigate={handleNavigate}
        onShowMaterialCalc={() => setShowMaterialCalc(true)}
      />

      <div className="relative">
        <Header
          title="ESG Dashboard"
          subtitle={`Welcome, ${user?.username || user?.email}`}
          onMenuClick={() => setShowSidebar(true)}
          actions={[]}
          onLogout={logout}
        />
        {userBULogo && (
          <img
            src={userBULogo}
            alt="BU Logo"
            className="absolute right-6 top-1/2 -translate-y-1/2 h-18 object-contain z-10"
          />
        )}
      </div>

      <main className="p-6 lg:p-8 max-w-7xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-3 mb-8 flex gap-2 flex-wrap">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm
                  transition-all duration-200 ${
                    isActive
                      ? tabColors[t.key].active
                      : `text-gray-500 bg-gray-50 ${tabColors[t.key].hover}`
                  }`}
              >
                <Icon className="w-4 h-4"/>
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'environmental' && (
          <EnvironmentalView onNavigate={handleNavigate}/>
        )}
        {activeTab === 'social' && <SocialView user={user} />}
        {activeTab === 'governance' && <GovernanceView user={user} />}

      </main>

      {showMaterialCalc && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
          onClick={() => setShowMaterialCalc(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Material EF Calculator</h2>
              <button onClick={() => setShowMaterialCalc(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <MaterialCalculatorWidget />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;