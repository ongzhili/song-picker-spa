import { CATBOXREGION } from "../utils/constants";
import "./RegionSelectBox.css";

type RegionSelectBoxProps = {
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
};

function RegionSelectBox({ region, setRegion }: RegionSelectBoxProps) {
  return (
    <div id="region-container">
      <label htmlFor="region-select">
        Select Region: (for AMQ links)
      </label>

      <select
        id="region-select"
        value={region}
        onChange={(e) =>
          setRegion(e.target.value as string)
        }
      >
        <option value={CATBOXREGION.nae}>NA East</option>
        <option value={CATBOXREGION.naw}>NA West</option>
        <option value={CATBOXREGION.eu}>EU</option>
      </select>
    </div>
  );
}

export default RegionSelectBox;