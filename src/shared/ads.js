import _ from 'lodash';

const items = _.shuffle([
    '<a href="http://s.click.aliexpress.com/e/qN7yJeiAU" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1gqUnJXXXXXcfaXXXq6xXFXXXB/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/2FuvN7eUZ" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1J_ZRJXXXXXcxXpXXq6xXFXXX5/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/Mj2JIeqj2" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1j3P4JXXXXXXsXFXXq6xXFXXXJ/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/IAUrnammA" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1eAv3JXXXXXaVXFXXq6xXFXXXW/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/jyn6mQZjU" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1P1_MJXXXXXX8apXXq6xXFXXXl/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/uJuBAYNFI" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1_gbUJXXXXXcpXVXXq6xXFXXXf/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/QzjqfMZba" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1avv6JXXXXXX2XFXXq6xXFXXX7/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/FQ7Aqz3Zj" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1K.vUJXXXXXbdXVXXq6xXFXXX3/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/qJU7QZ7AY" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1vQj3JXXXXXb0XFXXq6xXFXXXw/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/jYZRzrjE6" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1uF_MJXXXXXafXFXXq6xXFXXXl/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/ZN76Aa27E" target="_blank"><img width="725" height="90" src="http://gtms01.alicdn.com/tps/i1/T1q7w_FtlbXXXG_RZI-728-90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/eeAuBmAUb" target="_blank"><img width="725" height="90" src="http://gtms04.alicdn.com/tps/i4/T1MeN2FA8aXXXG_RZI-728-90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/QFeYNZfAA" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB13TD7GFXXXXXqapXXq6xXFXXXk/725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/yjaUFMFY3" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1O0C2HVXXXXcjXpXXq6xXFXXXi/728x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/2rb6mYnyr" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1778MIpXXXXbUXpXXq6xXFXXXI/725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/7AUrZjMvz" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1rDLfIVXXXXb6XXXXq6xXFXXXZ/725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/6qRzVfiUj" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1aUGpJXXXXXa.XXXXq6xXFXXXY/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/E6ImIiuZz" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1ZUHQJXXXXXXSXpXXq6xXFXXXD/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/UfAEU3Nvj" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1kA6WJXXXXXatXXXXq6xXFXXXG/en-725x90.jpg"/></a>',
    '<a href="http://s.click.aliexpress.com/e/VRfeEqfAM" target="_blank"><img width="725" height="90" src="http://g01.a.alicdn.com/kf/HTB1ohKNJXXXXXbFaXXXq6xXFXXXv/en-725x90.jpg"/></a>'
])

export default function(){
    var p = document.createElement('p');
    p.id = 'ads_banner';
    var item = items[Math.floor(Math.random()*items.length)];
    if(item){
        p.innerHTML = item;
    }
    return p;
}