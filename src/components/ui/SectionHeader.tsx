type SectionHeaderProps = {
  title: string;
  className?: string;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  className,
}) => (
  <h1 className={`mb-6 text-[2.5rem] font-medium ${className}`}>{title}</h1>
);
