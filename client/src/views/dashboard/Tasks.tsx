import Input from "../../components/Input";
import { CiEdit, CiTrash  } from "react-icons/ci";
import CheckBox from "../../components/Checkbox";

const TEMP_TASKS = [
    ["Update Customers data", 0],
    ["Review Shippings data", 1],
    ["Import latest Products data", 1],
    ["Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto placeat voluptates sint accusamus beatae sed provident eum reprehenderit aspernatur numquam sapiente in, illo ex. Dolor eligendi voluptatem numquam incidunt tempore.", 0]
] as [string, 0 | 1][]

export default function Tasks() {
    return (
        <div className="rounded-md overflow-hidden shadow-md">
            <div className="bg-second py-2 px-4">
                <h2 className="text-xl text-white font-semibold">Tasks</h2>
            </div>
            <div className="py-2 px-4 my-2 h-full">
                <div className="flex gap-2 justify-center items-center">
                    <Input curValue={null} label="What ya wanna do?" className="flex-1" />
                    <button className="px-4 py-2 mb-5 bg-primary rounded-md text-white">Add</button>
                </div>
                <div id="tasks" className="overflow-auto h-[180px]">
                    {TEMP_TASKS.map((task, index) => (
                        <div key={`task_${index}`} className="flex justify-between items-start border-b border-gray-200 py-2">
                            <div className="flex-1">
                                <div className="flex items-start gap-2">
                                    <CheckBox name={`task_${index}`} defaultChecked={task[1] == 1} />
                                    <label htmlFor="task" className="text-sm line-clamp-1 hover:line-clamp-none pt-1">{task[0]}</label>
                                </div>
                            </div>
                            <div className="flex items-start pt-1 gap-2">
                                <CiEdit className="cursor-pointer" />
                                <CiTrash className="cursor-pointer" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
