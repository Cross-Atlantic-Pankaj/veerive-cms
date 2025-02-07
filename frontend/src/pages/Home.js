import HomeTop from '../components/Home/HomeTop'
import Header from '../components/Home/Header'
import HomeTrendingEvents from '../components/Home/HomeTrendingEvents'
import HomeTrendingStats from '../components/Home/HomeTrendingStats'

export default function Home(){
    
    return (
        <div>
         
            <HomeTop/>
            <HomeTrendingEvents/>
            <HomeTrendingStats/>
           
        </div>
    )
}
