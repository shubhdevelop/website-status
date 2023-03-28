import React, {
  ChangeEvent,
  FC,
  useEffect,
  useContext,
  useReducer,
  useRef,
  useState,
} from 'react';
import useFetch from '@/hooks/useFetch';
import { isUserAuthorizedContext } from '@/context/isUserAuthorized';
import NavBar from '@/components/navBar/index';
import TaskContainer from './TaskContainer';
import Details from './Details';
import { toast, ToastTypes } from '@/helperFunctions/toast';
import updateTaskDetails from '@/helperFunctions/updateTaskDetails';
import task from '@/interfaces/task.type';
import classNames from './task-details.module.scss';

type Props = {
  url: string;
  taskID: string;
};

const initialState = {
  taskDetails: {} as task,
  editedDetails: {} as task,
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'setTaskDetails':
      return {
        ...state,
        taskDetails: { ...state.taskDetails, ...action.payload },
      };
    case 'setEditedDetails':
      return {
        ...state,
        editedDetails: { ...state.editedDetails, ...action.payload },
      };
    case 'reset':
      return { ...state, taskDetails: { ...action.payload } };
    default:
      return state;
  }
}

const TaskDetails: FC<Props> = ({ url, taskID }) => {
  const isAuthorized = useContext(isUserAuthorizedContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const initialDataRef = useRef<task>();
  const { response, error, isLoading } = useFetch(url);
  const { SUCCESS, ERROR } = ToastTypes;
  const { taskDetails } = state;
  useEffect(() => {
    const fetchedData: task = { ...response.taskData };
    dispatch({ type: 'setTaskDetails', payload: fetchedData });
    initialDataRef.current = fetchedData;
  }, [isLoading, response]);

  function convertTimeStamp(timeStamp: string) {
    const dateTime = new Date(parseInt(timeStamp));
    return dateTime.toLocaleString();
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const formData = {
      [event.target.name]: event.target.value,
    };
    dispatch({ type: 'setEditedDetails', payload: formData });
    dispatch({ type: 'setTaskDetails', payload: formData });
  }

  function onCancel() {
    setIsEditing(false);
    dispatch({ type: 'reset' });
    dispatch({ type: 'setTaskDetails', payload: initialDataRef.current });
  }

  async function onSave() {
    setIsEditing(false);
    try {
      const responseData = await updateTaskDetails(state.editedDetails, taskID);
      if (responseData.status === 204) {
        initialDataRef.current = state.taskDetails;
        toast(SUCCESS, 'Successfully saved');
      }
    } catch (err) {
      toast(ERROR, 'Could not save changes');
      dispatch({ type: 'setTaskDetails', payload: initialDataRef.current });
    }
    dispatch({ type: 'reset', payload: initialDataRef.current });
  }

  function renderTextarea(name: string, value: string) {
    return (
      <textarea
        className={classNames['textarea']}
        name={name}
        value={value}
        data-testid="edit button"
        onChange={(event) => handleChange(event)}
      />
    );
  }

  function renderButton(
    buttonName: string,
    clickHandler: (value: any) => void,
    value?: boolean
  ) {
    if (isAuthorized) {
      return (
        <button
          type="button"
          className={classNames['button']}
          onClick={() => clickHandler(value)}
        >
          {buttonName}
        </button>
      );
    }
  }

  function renderLoadingComponent() {
    if (isLoading) {
      return <p className={classNames.textCenter}>Loading...</p>;
    }
    if (error) {
      return <p className={classNames.textCenter}>Something went wrong!</p>;
    }
  }
  // console.log('is editing --->', isEditing);
  // console.log('error --->', Boolean(error));
  // console.log('taskdetails data --->', taskDetails);
  // console.log('isEditing --->', isEditing);

  return (
    <>
      <NavBar />
      {renderLoadingComponent()}

      {!isLoading && !error && taskDetails && (
        <div className={classNames.parentContainer}>
          <div className={classNames.titleContainer}>
            {!isEditing ? (
              <span data-testid="task-title" className={classNames.taskTitle}>
                {taskDetails[0]?.title}
              </span>
            ) : (
              renderTextarea('title', taskDetails[0]?.title)
            )}
            {!isEditing ? (
              renderButton('Edit', setIsEditing, true)
            ) : (
              <div className={classNames.editMode}>
                {renderButton('Cancel', onCancel)}
                {renderButton('Save', onSave)}
              </div>
            )}
          </div>

          <section className={classNames.detailsContainer}>
            <section className={classNames.leftContainer}>
              <TaskContainer title="Description" hasImg={false}>
                {!isEditing ? (
                  <p>
                    {!taskDetails[0]?.purpose
                      ? 'No description available'
                      : taskDetails[0]?.purpose}
                  </p>
                ) : (
                  renderTextarea('purpose', taskDetails[0]?.purpose)
                )}
              </TaskContainer>
              <TaskContainer title="Details" hasImg={false}>
                <div className={classNames['sub_details_grid_container']}>
                  <Details detailType={'Type'} value={taskDetails[0]?.type} />
                  <Details
                    detailType={'Priority'}
                    value={taskDetails[0]?.priority}
                  />
                  <Details
                    detailType={'Status'}
                    value={taskDetails[0]?.status}
                  />
                  <Details
                    detailType={'Link'}
                    value={taskDetails[0]?.featureUrl}
                  />
                </div>
              </TaskContainer>
            </section>

            <section className={classNames.rightContainer}>
              <TaskContainer
                src="/participant_logo.png"
                title="Participants"
                hasImg={true}
              >
                <Details
                  detailType={'Assignee'}
                  value={
                    taskDetails[0]?.type === 'feature'
                      ? taskDetails[0]?.assignee
                      : taskDetails[0]?.participants?.join(' , ')
                  }
                />
                <Details detailType={'Reporter'} value={'Ankush'} />
              </TaskContainer>
              <TaskContainer
                src="/calendar-icon.png"
                title="Dates"
                hasImg={true}
              >
                <Details
                  detailType={'StartedOn'}
                  value={convertTimeStamp(taskDetails[0]?.startedOn)}
                />
                <Details
                  detailType={'EndsOn'}
                  value={convertTimeStamp(taskDetails[0]?.endsOn)}
                />
              </TaskContainer>
            </section>
          </section>
        </div>
      )}
    </>
  );
};

export default TaskDetails;
