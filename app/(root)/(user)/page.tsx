import {UserList} from "@/components/user/UserList";

const Home = async () => {
  return (
      <div className={"flex w-full h-full p-4"}>
          <div className={"w-full"}>

          </div>
          <div className={"w-[356px] h-[450px] hidden lg:block gap-2"}>
              <p className={"heading5 mb-4"}>Danh sách bạn bè</p>
              <UserList type={"friends"} />
          </div>
      </div>
  );
}

export default Home;