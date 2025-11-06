import {UserList} from "@/components/user/UserList";
import NewFeed from "@/components/user/NewFeed";

const Home = async () => {
  return (
      <div className={"flex w-full h-full p-4"}>
          <div className={"w-full flex items-start "}>
              <div className={"flex flex-col gap-4 mx-auto w-full max-w-[600px] h-fit text-foreground"}>
                  <NewFeed/>
              </div>
          </div>
          <div className={"w-[356px] h-[450px] hidden lg:block gap-2"}>
              <p className={"heading5 mb-4"}>Danh sách bạn bè</p>
              <UserList type={"friends"} />
          </div>
      </div>
  );
}

export default Home;