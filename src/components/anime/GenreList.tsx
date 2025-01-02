import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GENRES = [
  {
    name: 'Action',
    description: 'Exciting fights and thrilling combat scenes',
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'Adventure',
    description: 'Epic journeys and exploration',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Comedy',
    description: 'Laugh-out-loud moments and humor',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    name: 'Drama',
    description: 'Emotional stories and character development',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Fantasy',
    description: 'Magical worlds and mythical creatures',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Horror',
    description: 'Scary and suspenseful content',
    color: 'from-gray-700 to-gray-900',
  },
  {
    name: 'Mecha',
    description: 'Giant robots and mechanical action',
    color: 'from-slate-500 to-gray-500',
  },
  {
    name: 'Mystery',
    description: 'Intriguing puzzles and suspense',
    color: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Romance',
    description: 'Love stories and relationships',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Sci-Fi',
    description: 'Futuristic technology and space',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Slice of Life',
    description: 'Everyday life and relationships',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    name: 'Sports',
    description: 'Athletic competition and teamwork',
    color: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Supernatural',
    description: 'Paranormal and mystical elements',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    name: 'Thriller',
    description: 'Suspenseful and intense stories',
    color: 'from-red-700 to-rose-700',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function GenreList() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {GENRES.map((genre) => (
        <motion.div key={genre.name} variants={item}>
          <Link
            to={`/genre/${genre.name}`}
            className="group relative block h-48 overflow-hidden rounded-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-75 transition-opacity group-hover:opacity-90`} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
              <h3 className="text-xl font-bold">{genre.name}</h3>
              <p className="mt-2 text-sm opacity-90">{genre.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}