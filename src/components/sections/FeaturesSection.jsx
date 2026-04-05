import { TrendingUp, Sparkles, Tag } from 'lucide-react';
import { features } from '../../data/products';
import styles from './FeaturesSection.module.css';

const iconMap = {
  'trending-up': TrendingUp,
  'sparkles': Sparkles,
  'tag': Tag,
};

export default function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {features.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <div key={feature.id} className={styles.feature}>
              <div className={styles.iconWrapper}>
                <Icon size={22} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}