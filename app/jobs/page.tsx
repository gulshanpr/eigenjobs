"use client";
import { useEffect, useState } from "react";
import Card from "./_components/Card";
import TextFilter from "./_components/TextFilter";
import LocationFilter from "./_components/LocationFilter";
import MultiSelectFilter from "./_components/MultiSelectFilter";
import CategoryButtons from "./_components/CategoryButtons";

interface Job {
  id: string;
  role: string;
  type: string;
  location: string;
  hybrid: string;
  jobFunction: string;
  jobDescription: string;
  company: string;
  category: string;
  logo: string;
}

const JobsPage = () => {
  const [selectedJobFunction, setSelectedJobFunction] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string[]>([]);
  const [filteredjobs, setFilteredJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>("");

  const handleFilterChange = (data: string) => {
    setSearchTitle(data);
  };

  const handleLocationChange = (data: string) => {
    setSearchLocation(data);
  };

  useEffect(() => {
    const fetchAllJobs = async () => {
      let allJobs: Job[] = [];
      let hasMore = true;
      let cursor: string | null = null;
      let allJobsIntMid: Job[] = [];

      while (hasMore) {
        try {
          const url: string = cursor
            ? `/api/jobs?cursor=${cursor}`
            : "/api/jobs";

          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();

            allJobsIntMid = [...allJobsIntMid, ...data.jobs];
            hasMore = data.hasMore;
            cursor = data.nextCursor;
          } else {
            console.error("Failed to fetch jobs:", response.statusText);
            hasMore = false;
          }
        } catch (error) {
          console.error("Error fetching jobs:", error);
          hasMore = false;
        }
      }

      allJobs = [...allJobsIntMid].reverse();
      setAllJobs(allJobs);
      setFilteredJobs(allJobs);
    };

    fetchAllJobs();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      handleFilters(
        allJobs,
        selectedJobFunction,
        selectedJobType,
        activeCategories,
        searchLocation,
        searchTitle
      );
    };

    if (allJobs.length > 0) {
      applyFilters();
    }
  }, [
    allJobs,
    selectedJobFunction,
    selectedJobType,
    activeCategories,
    searchLocation,
    searchTitle,
  ]);

  const handleFilters = (
    jobs: Job[],
    selectedJobFunctions: string[],
    selectedJobTypes: string[],
    categories: string[],
    location: string,
    title: string
  ) => {
    if (
      selectedJobFunctions.length === 0 &&
      selectedJobTypes.length === 0 &&
      categories.length === 0 &&
      !location &&
      !title
    ) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job) => {
      const matchesCategory =
        categories.length > 0 ? categories.includes(job.category) : true;
      const matchesJobFunction =
        selectedJobFunctions.length > 0
          ? selectedJobFunctions.includes(job.jobFunction)
          : true;
      const matchesJobType =
        selectedJobTypes.length > 0
          ? selectedJobTypes.some((type) => {
              if (type === "Remote") {
                return job.type === "Remote" && job.hybrid === "False";
              } else {
                return job.hybrid === "True";
              }
            })
          : true;

      const matchesLocation = location
        ? job.location.toLowerCase().includes(location.toLowerCase())
        : true;
      const matchesTitle = searchTitle
        ? job.role.toLowerCase().includes(title.toLowerCase())
        : true;

      return (
        matchesCategory &&
        matchesJobFunction &&
        matchesJobType &&
        matchesLocation &&
        matchesTitle
      );
    });

    setFilteredJobs(filtered);
  };

  const handleCategory = (cate: string) => {
    setActiveCategories((prevCategories) =>
      prevCategories.includes(cate)
        ? prevCategories.filter((cat) => cat !== cate)
        : [...prevCategories, cate]
    );
  };

  useEffect(() => {
    handleFilters(
      allJobs,
      selectedJobFunction,
      selectedJobType,
      activeCategories,
      searchLocation,
      searchTitle
    );
  }, [
    selectedJobFunction,
    selectedJobType,
    activeCategories,
    searchLocation,
    searchTitle,
  ]);

  return (
    <main className="pb-10 mx-auto" id="job-dashboard">
      <div className="bg-[#f7fafc] px-7 md:px-12 py-16">
        <div className="mx-auto flex flex-col gap-14">
          <div className="bg-white border-[1.5px] rounded-sm flex flex-col">
            <div className="flex flex-col lg:gap-4 lg:flex-row divide-y-[1.5px] lg:divide-x-[1.5px] lg:divide-y-0 border-b">
              <TextFilter onTextFilterChange={handleFilterChange} />
              <LocationFilter onLocationFilterChange={handleLocationChange} />
            </div>
            <div className="flex flex-col px-4 py-3 w-full gap-4 ">
              <MultiSelectFilter
                selectedJobFunction={selectedJobFunction}
                setSelectedJobFunction={setSelectedJobFunction}
                selectedJobType={selectedJobType}
                setSelectedJobType={setSelectedJobType}
              >
                <CategoryButtons
                  activeCategories={activeCategories}
                  handleCategory={handleCategory}
                />
              </MultiSelectFilter>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-10 flex flex-col gap-5 mx-auto px-7 md:px-12">
        <p className="text-sm text-slate-800">
          Showing <span className="font-bold">{filteredjobs.length}</span> jobs
        </p>
        <div className="flex flex-col gap-3">
          {filteredjobs.map((job) => (
            <Card key={job.id} job={job} />
          ))}
        </div>
      </div>
    </main>
  );
};
export default JobsPage;
