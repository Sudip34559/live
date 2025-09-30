import { Tab } from "./ui/tab";

export const PricingHeader = ({
  title,
  subtitle,
  frequencies,
  selectedFrequency,
  onFrequencyChange,
}: {
  title: string;
  subtitle: string;
  frequencies: string[];
  selectedFrequency: string;
  onFrequencyChange: (frequency: string) => void;
}) => (
  <div className="space-y-7 text-center">
    <div className="space-y-4">
      <h1 className="text-4xl font-medium md:text-5xl">{title}</h1>
      <p>{subtitle}</p>
    </div>
    <div className="mx-auto flex w-fit rounded-full bg-[#f3e5f5] p-1 dark:bg-[#4a3d5a]">
      {frequencies.map((freq) => (
        <Tab
          key={freq}
          text={freq}
          selected={selectedFrequency === freq}
          setSelected={onFrequencyChange}
          discount={freq === "yearly"}
        />
      ))}
    </div>
  </div>
);
