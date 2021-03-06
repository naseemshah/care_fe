import React, { useCallback, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getShiftRequests } from "../../Redux/actions";
import Button from "@material-ui/core/Button";
import { navigate } from "hookrouter";
import moment from "moment";

const limit = 30;

const formatFilter = (filter: any) => {
  return {
    status: filter.status === 'Show All' ? null : filter.status,
    facility: '',
    orgin_facility: filter.orgin_facility,
    shifting_approving_facility: filter.shifting_approving_facility,
    assigned_facility: filter.assigned_facility,
    emergency: (filter.emergency && filter.emergency) === '--' ? '' : (filter.emergency === 'yes' ? 'true' : 'false'),
    is_up_shift: (filter.is_up_shift && filter.is_up_shift) === '--' ? '' : (filter.is_up_shift === 'yes' ? 'true' : 'false'),
    limit: limit,
    offset: filter.offset,
    patient_name: filter.patient_name || undefined
  };
}

interface boardProps {
  board: string,
  filterProp: any
}

export default function ListView({ board, filterProp }: boardProps) {

  const dispatch: any = useDispatch();
  const [filter, setFilter] = useState(filterProp);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);


  const filterOnChange = (filterData: any) => {
    setFilter(filterData);
  }
  useEffect(() => {
    setFilter(filterProp)
  }, [filterProp])
  useEffect(() => {
    setIsLoading(true);
    dispatch(getShiftRequests(formatFilter({ ...filterProp, status: board }), board)).then((res: any) => {
      if (res && res.data) {
        setData(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    });
  },
    [board, dispatch, filter, filterProp]
  );

  const handlePagination = (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    setCurrentPage(page);
    dispatch(getShiftRequests(formatFilter({ ...filterProp, status: board, offset: offset }), board)).then((res: any) => {
      console.log("Received:" + board)
      if (res && res.data) {
        setData(data => [...data, ...res.data.results]);
        setTotalCount(res.data.count);
        setCurrentPage(1)
      }
      setIsLoading(false);
    });
  };

  let patientFilter = (filter: string) => {
    console.log("Re-Rendering")
    return data
      .filter(({ status }) => status === filter)
      .map((shift: any, idx: number) =>
        <div key={`shift_${shift.id}`} className="w-full mt-2 ">
          <div className="overflow-hidden shadow rounded-lg bg-white h-full mx-2">
            <div className="p-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between">
                  <div className="font-bold text-xl capitalize mb-2">
                    {shift.patient_object.name}
                  </div>
                  <div>
                    {shift.emergency && (
                      <span className="flex-shrink-0 inline-block px-2 py-0.5 text-red-800 text-xs leading-4 font-medium bg-red-100 rounded-full">Emergency</span>
                    )}
                  </div>
                </div>
                <dl className="grid grid-cols-1 col-gap-1 row-gap-2 sm:grid-cols-1">
                  <div className="sm:col-span-1">
                    <dt className="text-sm leading-5 font-medium text-gray-500">
                      <i className="fas fa-plane-departure mr-2"></i>
                      Origin facility
                  </dt>
                    <dd className="font-bold text-sm leading-5 text-gray-900">
                      {(shift.orgin_facility_object || {}).name}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm leading-5 font-medium text-gray-500">
                      <i className="fas fa-user-check mr-2"></i>
                      Shifting approving facility
                  </dt>
                    <dd className="font-bold text-sm leading-5 text-gray-900">
                      {(shift.shifting_approving_facility_object || {}).name}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm leading-5 font-medium text-gray-500">
                      <i className="fas fa-plane-arrival mr-2"></i>
                      Assigned facility
                  </dt>
                    <dd className="font-bold text-sm leading-5 text-gray-900">
                      {(shift.assigned_facility_object || {}).name}
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm leading-5 font-medium text-gray-500">
                      <i className="fas fa-stopwatch mr-2"></i>
                      Last Modified
                  </dt>
                    <dd className="font-bold text-sm leading-5 text-gray-900">
                      {moment(shift.modified_date).format("LLL") || "--"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-2">
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/shifting/${shift.external_id}`)}
                >
                  View All Details
                  </Button>
              </div>
            </div>
          </div>
        </div>
      );
  }
  return (
    <div className="bg-gray-200 py-2 mr-2 flex-shrink-0 w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 pb-4 h-full overflow-y-auto rounded-md">
      <div className="flex justify-between p-4 rounded mx-2 bg-white shadow">
        <h3 className="text-sm flex">{board}
        </h3>
        <span className="rounded-lg ml-2 bg-gray-700 text-white px-2">
          {totalCount || "0"}
        </span>
      </div>
      <div className="text-sm mt-2 pb-2 flex flex-col">
        {isLoading ?
          <div className="m-1">
            <div className="border border-gray-300 bg-white shadow rounded-md p-4 max-w-sm w-full mx-auto">
              <div className="animate-pulse flex space-x-4 ">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-400 rounded"></div>
                    <div className="h-4 bg-gray-400 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div> : data?.length > 0 ? patientFilter(board) : <p className="mx-auto p-4">No Patients to Show</p>}
        {!isLoading && data?.length < (totalCount || 0) &&
          <button onClick={_ => handlePagination(currentPage + 1, limit)} className="mx-auto my-4 p-2 px-4 bg-gray-100 rounded-md hover:bg-white">More...</button>}
      </div>
    </div>
  );
}
