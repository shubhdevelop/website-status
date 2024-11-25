import React from 'react';
import ProgressContainer from '../tasks/card/progressContainer';
import Modal from '../Modal';
import getCurrentDate from '@/utils/getLatestDate';
import { questions } from '@/constants/ProgressUpdates';
import ProgressForm from '../ProgressForm/ProgressForm';
import task from '@/interfaces/task.type';

type Props = {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    styles: {
        readonly [key: string]: string;
    },
    isDev: boolean,
    taskDetailsData: task,
    editedTaskDetails: task,
}

function TaskUpdateModal({ isOpen, setIsOpen, styles, isDev, taskDetailsData, editedTaskDetails }: Props) {
    return (
        <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} >
            <div className={styles.taskUpdateModal}>
                <h3 className={styles.updateProgress}>Update Progress</h3>
                <section className={styles.containerUpdate}>
                    <h1 className={styles.formHeading}>Task Updates</h1>
                    <h2 className={styles.dateUpdated}>On {getCurrentDate()}</h2>
                    <ProgressForm questions={questions} />
                </section>
                <div className={styles.hr} />
                <ProgressContainer
                    isDev={isDev}
                    content={taskDetailsData}
                    key={editedTaskDetails?.percentCompleted}
                />
            </div>
        </Modal>
    );
}

export default TaskUpdateModal;