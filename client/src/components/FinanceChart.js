import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function DoughnutChart({ income, expense }) {
  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expense],
      backgroundColor: ['#4caf5088', '#ff6b6b88'],
      borderColor: ['#4caf50', '#ff6b6b'],
      borderWidth: 2,
    }]
  };

  const options = {
    plugins: {
      legend: { labels: { color: '#fff' } }
    }
  };

  return <Doughnut data={data} options={options} />;
}

export function BarChart({ transactions }) {
  // تجميع البيانات حسب الشهر
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const incomeByMonth = new Array(12).fill(0);
  const expenseByMonth = new Array(12).fill(0);

  transactions.forEach(t => {
    const month = new Date(t.date).getMonth();
    if (t.type === 'income') incomeByMonth[month] += t.amount;
    else expenseByMonth[month] += t.amount;
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: incomeByMonth,
        backgroundColor: '#4caf5088',
        borderColor: '#4caf50',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: expenseByMonth,
        backgroundColor: '#ff6b6b88',
        borderColor: '#ff6b6b',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    plugins: {
      legend: { labels: { color: '#fff' } }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#222' } },
      y: { ticks: { color: '#aaa' }, grid: { color: '#222' } }
    }
  };

  return <Bar data={data} options={options} />;
}